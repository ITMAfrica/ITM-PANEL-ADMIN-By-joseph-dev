import { randomUUID } from 'crypto';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import path from 'path';

const ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER ?? 'media';
const CDN_BASE = process.env.AZURE_STORAGE_CDN_URL;

interface ParsedConnection {
  account: string;
  endpointSuffix: string;
}

function parseConnectionString(connStr: string): ParsedConnection | null {
  const pairs = new Map<string, string>();
  for (const entry of connStr.split(';')) {
    const sep = entry.indexOf('=');
    if (sep === -1) continue;
    pairs.set(entry.slice(0, sep), entry.slice(sep + 1));
  }
  const account = pairs.get('AccountName');
  if (!account) return null;
  return { account, endpointSuffix: pairs.get('EndpointSuffix') ?? 'core.windows.net' };
}

const parsedConn = CONNECTION_STRING ? parseConnectionString(CONNECTION_STRING) : null;
const ACCOUNT_NAME = ACCOUNT ?? parsedConn?.account ?? null;
const ENDPOINT_SUFFIX = parsedConn?.endpointSuffix ?? 'core.windows.net';

let cachedClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient {
  if (cachedClient) return cachedClient;

  if (CONNECTION_STRING) {
    cachedClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  } else if (ACCOUNT_NAME && ACCOUNT_KEY) {
    const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
    cachedClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.${ENDPOINT_SUFFIX}`,
      credential
    );
  } else {
    throw new Error(
      'Azure Storage non configuré : définir AZURE_STORAGE_CONNECTION_STRING ' +
        'ou AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_ACCESS_KEY'
    );
  }

  return cachedClient;
}

function getPublicBaseUrl(): string {
  if (CDN_BASE) return CDN_BASE.replace(/\/$/, '');
  if (!ACCOUNT_NAME) {
    throw new Error('AZURE_STORAGE_ACCOUNT non configuré');
  }
  return `https://${ACCOUNT_NAME}.blob.${ENDPOINT_SUFFIX}/${CONTAINER}`;
}

async function ensureContainer(): Promise<void> {
  const client = getBlobServiceClient().getContainerClient(CONTAINER);
  await client.createIfNotExists({ access: 'blob' });
}

function blobNameFor(tenantId: string, filename: string): string {
  return `${tenantId}/${filename}`;
}

export async function uploadToStorage(
  tenantId: string,
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  await ensureContainer();
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext).replace(/[^\w.\-]+/g, '-').slice(0, 120) || 'file';
  const filename = `${randomUUID()}-${base}${ext}`;
  const blobName = blobNameFor(tenantId, filename);

  const blockBlob = getBlobServiceClient()
    .getContainerClient(CONTAINER)
    .getBlockBlobClient(blobName);

  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return `${getPublicBaseUrl()}/${blobName}`;
}

export async function deleteFromStorage(tenantId: string, url: string): Promise<void> {
  try {
    const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    if (!filename) return;
    const blobName = blobNameFor(tenantId, filename);
    await getBlobServiceClient()
      .getContainerClient(CONTAINER)
      .getBlockBlobClient(blobName)
      .deleteIfExists();
  } catch {
    // L'URL ne correspond pas à Azure (ex. ancien fichier local) : on ignore.
  }
}

export function isAzureConfigured(): boolean {
  return Boolean(CONNECTION_STRING || (ACCOUNT_NAME && ACCOUNT_KEY));
}
