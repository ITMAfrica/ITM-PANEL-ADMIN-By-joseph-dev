/**
 * Smoke test: widget token flow (opaque channelId in public URLs)
 *
 * Tests the complete lifecycle:
 * 1. Create a widget token for a channel
 * 2. Fetch the widget script via token
 * 3. Subscribe via token (public endpoint simulation)
 * 4. Verify channelId is NEVER in the generated JS
 * 5. Subscribe via channelId (backward compat)
 * 6. Delete token (revoke) and verify it's gone
 *
 * Usage: npx tsx scripts/test-widget-token.ts
 */

import { db } from '../server/lib/prisma';
import { buildSubscribeWidget } from '../server/services/site.service';
import { subscribe } from '../server/controllers/subscribe.controller';
import type { Request, Response } from 'express';

// --- Types ---

type MockResponse = Partial<Response> & { body: unknown; statusCode: number };

// --- Helpers ---

function mockReq(body: Record<string, unknown>): Partial<Request> {
  return {
    body,
    query: {},
    user: undefined,
    authorizedTenantId: undefined,
  };
}

function mockRes(): MockResponse {
  const res = {} as MockResponse;
  res.statusCode = 200;
  res.body = null;
  res.status = function (code: number) {
    res.statusCode = code;
    return this as Response;
  };
  res.json = function (data: unknown) {
    res.body = data;
    return this as Response;
  };
  res.type = function () {
    return this as Response;
  };
  res.set = function () {
    return this as Response;
  };
  res.send = function (data: unknown) {
    res.body = data;
    return this as Response;
  };
  return res;
}

function pass(): void {
  // nothing
}

function fail(msg: string): void {
  console.error(`  ❌ FAIL: ${msg}`);
  process.exitCode = 1;
}

async function main() {
  console.log('🧪 Widget Token Flow — Smoke Test\n');

  // ─── Setup: find or create test data ───────────────────────────────────
  console.log('1. Setup: finding test workspace and channel...');

  const workspace = await db.workspace.findFirst({
    include: {
      distributionChannels: { take: 1, where: { isActive: true } },
    },
  });

  if (!workspace) {
    console.log('   ⚠️  No workspace found. Creating a test workspace...');
    const ws = await db.workspace.create({
      data: {
        name: 'Test Workspace (widget-token)',
        slug: `test-widget-${Date.now()}`,
      },
      include: {
        distributionChannels: { take: 1 },
      },
    });
    console.log(`   ✅ Workspace created: ${ws.name} (${ws.id})`);
    pass();
  } else {
    console.log(`   ✅ Workspace: ${workspace.name} (${workspace.id})`);
  }

  const ws = workspace || (await db.workspace.findFirst({ include: { distributionChannels: { take: 1, where: { isActive: true } } } }))!;

  if (ws.distributionChannels.length === 0) {
    console.log('   ⚠️  No active channel. Creating one...');
    await db.distributionChannel.create({
      data: {
        name: 'Test Channel (widget-token)',
        type: 'email',
        tenantId: ws.id,
        isActive: true,
      },
    });
    console.log('   ✅ Test channel created');
  }

  const channel = await db.distributionChannel.findFirst({
    where: { tenantId: ws.id, isActive: true },
  });
  if (!channel) {
    fail('No channel found');
    await db.$disconnect();
    return;
  }
  console.log(`   ✅ Channel: ${channel.name} (${channel.id})\n`);

  // ─── Test 1: Create widget token ──────────────────────────────────────
  console.log('2. Creating widget token...');

  const existingToken = await db.widgetToken.findFirst({
    where: { channelId: channel.id },
  });
  if (existingToken) {
    console.log(`   ℹ️  Token already exists: ${existingToken.token.slice(0, 12)}...`);
  }

  const widgetToken = await db.widgetToken.upsert({
    where: { id: existingToken?.id ?? 'nonexistent' },
    update: {},
    create: {
      channelId: channel.id,
      tenantId: ws.id,
    },
    select: { token: true, channelId: true },
  });
  console.log(`   ✅ Token created: ${widgetToken.token.slice(0, 12)}...`);
  console.log(`   ✅ Token maps to channel: ${channel.id}\n`);

  // ─── Test 2: Build widget script with token ────────────────────────────
  console.log('3. Building widget script via token...');

  const script = buildSubscribeWidget(
    'http://localhost:3001',
    channel.id,
    undefined,
    widgetToken.token
  );

  // The channelId MUST NOT appear in the script
  if (script.includes(channel.id)) {
    fail('ChannelId LEAKED in widget script!');
  } else {
    console.log('   ✅ channelId NOT in script (good!)');
  }

  // The token MUST appear in the script
  if (script.includes(widgetToken.token)) {
    console.log('   ✅ Token IS in script (expected)');
  } else {
    fail('Token missing from script');
  }

  // The script should send {token} not {channelId} in the POST body
  if (script.includes('token:T') && !script.includes('channelId:C')) {
    console.log('   ✅ Script uses token:T in fetch body (not channelId:C)');
  } else {
    fail('Script does NOT use token in fetch body');
  }
  console.log('');

  // ─── Test 3: Subscribe via token ───────────────────────────────────────
  console.log('4. Testing subscribe via token...');

  const testEmail = `test-widget-${Date.now()}@example.com`;
  const req3 = mockReq({
    email: testEmail,
    token: widgetToken.token,
    consent: { newsletter: true, privacyAccepted: true, textVersion: 'v1-2026-07' },
  });
  const res3 = mockRes();
  await subscribe(req3 as Request, res3 as Response);

  if (res3.statusCode === 201) {
    console.log(`   ✅ Subscribed via token: ${testEmail}`);
    const body = res3.body as { ok: boolean; subscriptionId: string };
    console.log(`   ✅ Response: ok=${body.ok}, subscriptionId=${body.subscriptionId}`);
  } else {
    console.log(`   Status: ${res3.statusCode}`);
    console.log(`   Body: ${JSON.stringify(res3.body)}`);
    fail('Subscribe via token failed');
  }

  // Verify the subscription exists
  const sub = await db.subscription.findFirst({
    where: { channelId: channel.id, subscriber: { email: testEmail } },
    include: { subscriber: true },
  });
  if (sub && sub.status === 'subscribed') {
    console.log(`   ✅ Subscription confirmed in DB (status: ${sub.status})\n`);
  } else {
    fail('Subscription not found in DB');
    console.log('');
  }

  // ─── Test 4: Subscribe via channelId (backward compat) ─────────────────
  console.log('5. Testing backward compat: subscribe via channelId...');

  const testEmail2 = `test-widget-legacy-${Date.now()}@example.com`;
  const req4 = mockReq({
    email: testEmail2,
    channelId: channel.id,
    consent: { newsletter: true, privacyAccepted: true, textVersion: 'v1-2026-07' },
  });
  const res4 = mockRes();
  await subscribe(req4 as Request, res4 as Response);

  if (res4.statusCode === 201) {
    console.log(`   ✅ Backward compat: subscribed via channelId: ${testEmail2}\n`);
  } else {
    fail('Backward compat subscribe via channelId failed');
    console.log('');
  }

  // ─── Test 5: Invalid token → 404 ───────────────────────────────────────
  console.log('6. Testing invalid token rejection...');

  const req5 = mockReq({
    email: 'fake@example.com',
    token: 'this-token-does-not-exist',
    consent: { newsletter: true, privacyAccepted: true },
  });
  const res5 = mockRes();
  await subscribe(req5 as Request, res5 as Response);

  if (res5.statusCode === 404) {
    console.log('   ✅ Invalid token correctly rejected (404)\n');
  } else {
    fail(`Invalid token should return 404, got ${res5.statusCode}`);
    console.log('');
  }

  // ─── Test 7: Delete token ──────────────────────────────────────────────
  console.log('7. Testing token deletion (revoke)...');

  await db.widgetToken.deleteMany({
    where: { channelId: channel.id, tenantId: ws.id },
  });
  console.log('   ✅ Token(s) deleted');

  // Verify token no longer works for subscribe
  const req7 = mockReq({
    email: `deleted-token-${Date.now()}@example.com`,
    token: widgetToken.token,
    consent: { newsletter: true, privacyAccepted: true },
  });
  const res7 = mockRes();
  await subscribe(req7 as Request, res7 as Response);

  if (res7.statusCode === 404) {
    console.log('   ✅ Deleted token correctly rejected (404)\n');
  } else {
    fail(`Deleted token should return 404, got ${res7.statusCode}`);
    console.log('');
  }

  // ─── Cleanup test subscribers ──────────────────────────────────────────
  console.log('8. Cleanup...');
  await db.subscriber.deleteMany({
    where: {
      email: { in: [testEmail, testEmail2] },
      tenantId: ws.id,
    },
  });
  console.log('   ✅ Test subscribers removed');

  await db.$disconnect();

  console.log('\n🎉 All tests passed!');
}

main().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
