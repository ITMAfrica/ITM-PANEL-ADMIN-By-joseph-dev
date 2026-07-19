import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSubscribeWidget } from '../services/site.service';

describe('buildSubscribeWidget — Newsletter Embed', () => {
  const panelOrigin = 'https://api.itmafrica.com';
  const channelId = 'c_test123';
  const siteSlug = 'monsite-com';

  it('returns a self-executing anonymous function', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.startsWith('(function(){'), 'should start with IIFE');
    assert.ok(script.endsWith('})();'), 'should end with IIFE');
  });

  it('contains the panel origin and channelId', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('"https://api.itmafrica.com"'), 'should contain panel origin');
    assert.ok(script.includes('"c_test123"'), 'should contain channelId');
  });

  it('renders an email input field', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('type="email"'), 'should contain email input');
    assert.ok(script.includes('placeholder="votre@email.com"'), 'should contain placeholder');
  });

  it('renders a subscribe button', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes("S'abonner") || script.includes("S\\'abonner"), 'should contain subscribe button text');
    assert.ok(script.includes('type="submit"'), 'should contain submit button');
  });

  it('posts to the correct subscribe endpoint', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('/api/public/subscribe'), 'should target subscribe endpoint');
    assert.ok(script.includes("method:'POST'"), 'should use POST method');
  });

  it('includes the channelId in the POST body', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes(`channelId:C`), 'should reference channelId variable');
    assert.ok(script.includes(`email:email`), 'should include email in body');
  });

  it('includes consent checkbox and tracking payload', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('itm-sub-consent'), 'should render consent checkbox');
    assert.ok(script.includes('consent:'), 'should send consent in payload');
    assert.ok(script.includes('collectContext'), 'should collect page context');
    assert.ok(script.includes('collectTechnical'), 'should collect technical metadata');
    assert.ok(script.includes('v1-2026-07'), 'should include consent text version');
  });

  it('handles success message', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('Merci'), 'should show success message');
    assert.ok(script.includes("Vous êtes abonné"), 'should confirm subscription');
  });

  it('handles error display', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('Erreur réseau'), 'should show network error');
    assert.ok(script.includes('itm-sub-error'), 'should have error CSS class');
  });

  it('supports optional siteSlug parameter', () => {
    const scriptWithout = buildSubscribeWidget(panelOrigin, channelId);
    const scriptWith = buildSubscribeWidget(panelOrigin, channelId, siteSlug);

    // With siteSlug, the script should contain it
    assert.ok(scriptWith.includes('"monsite-com"'), 'should contain siteSlug when provided');

    // Without siteSlug, it should auto-detect from hostname
    assert.ok(scriptWithout.includes('window.location.hostname'), 'should auto-detect hostname');
  });

  it('escapes XSS vectors in parameters', () => {
    const maliciousChannelId = 'test<script>alert(1)</script>';
    const script = buildSubscribeWidget(panelOrigin, maliciousChannelId);
    assert.ok(!script.includes('<script>'), 'should escape <script> tags');
    assert.ok(script.includes('\\x3c'), 'should use \\x3c escaping');
    assert.ok(script.includes('\\x3e'), 'should use \\x3e escaping');
  });

  it('generates valid CSS classes', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('itm-subscribe-widget'), 'should have widget wrapper class');
    assert.ok(script.includes('itm-sub-form'), 'should have form class');
    assert.ok(script.includes('itm-sub-input'), 'should have input class');
    assert.ok(script.includes('itm-sub-btn'), 'should have button class');
    assert.ok(script.includes('itm-sub-msg'), 'should have message class');
  });

  it('disables the button during submission', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('btn.disabled=true'), 'should disable button on submit');
    assert.ok(script.includes("btn.textContent='Envoi…'"), 'should show loading text');
    assert.ok(script.includes('btn.disabled=false'), 'should re-enable button after response');
  });

  it('is responsive with flexbox layout', () => {
    const script = buildSubscribeWidget(panelOrigin, channelId);
    assert.ok(script.includes('display:flex'), 'should use flexbox');
    assert.ok(script.includes('flex-wrap:wrap'), 'should wrap on small screens');
  });
});
