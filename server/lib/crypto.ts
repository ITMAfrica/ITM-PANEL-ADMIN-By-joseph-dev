import crypto from 'crypto';

/**
 * Chiffrement au repos des secrets applicatifs (v1 : Page access tokens Meta).
 * AES-256-GCM, format versionné "v1:iv:tag:ciphertext" (base64) — le préfixe de
 * version permettra une rotation de clé ou un changement d'algorithme sans
 * migration destructive.
 *
 * Clé : META_TOKEN_ENCRYPTION_KEY (32 octets hex) si définie, sinon dérivation
 * scrypt d'AUTH_SECRET (toujours présent grâce au garde-fou de démarrage).
 */

const FORMAT_VERSION = 'v1';
const KEY_DERIVATION_SALT = 'itm-meta-token-v1';

function getKey(): Buffer {
  const hex = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (hex) {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error('META_TOKEN_ENCRYPTION_KEY must be 32 bytes hex-encoded (64 hex chars)');
    }
    return Buffer.from(hex, 'hex');
  }
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return crypto.scryptSync(secret, KEY_DERIVATION_SALT, 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    FORMAT_VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, data] = payload.split(':');
  if (version !== FORMAT_VERSION || !iv || !tag || !data) {
    throw new Error('Unsupported encrypted secret format');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}
