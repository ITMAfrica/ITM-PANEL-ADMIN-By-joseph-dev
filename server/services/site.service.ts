import { randomBytes } from 'crypto';
import { db } from '../lib/prisma';

export interface SiteConnectionResult {
  id: string;
  slug: string;
  name: string;
  url: string;
  status: string;
  tenantId: string;
  apiKey: string;
  embedScript: string;
  metaTag: string;
  reachable: boolean;
  verifiedAt: string | null;
  panelOrigin: string;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = '';
  url.search = '';
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.origin + (url.pathname === '/' ? '' : url.pathname);
}

export function urlToSlug(input: string): string {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.hostname
      .replace(/^www\./i, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 48);
  } catch {
    return input
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 48);
  }
}

function siteNameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, '');
    return (
      hostname
        .split('.')
        .slice(0, -1)
        .join(' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || hostname
    );
  } catch {
    return 'Mon site';
  }
}

export function getApiOrigin(): string {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '');
  if (apiUrl) return apiUrl.replace(/\/$/, '');
  return 'http://localhost:3001';
}

export function buildEmbedScript(panelOrigin: string, slug: string): string {
  return `<script src="${panelOrigin}/api/connect/${slug}" async></script>`;
}

export function buildMetaTag(slug: string): string {
  return `<meta name="itm-panel" content="${slug}">`;
}

function toConnectionResult(
  site: {
    id: string;
    slug: string;
    name: string;
    url: string;
    status: string;
    tenantId: string;
    apiKey: string;
    verifiedAt: Date | null;
  },
  panelOrigin: string
): SiteConnectionResult {
  return {
    id: site.id,
    slug: site.slug,
    name: site.name,
    url: site.url,
    status: site.status,
    tenantId: site.tenantId,
    apiKey: site.apiKey,
    embedScript: buildEmbedScript(panelOrigin, site.slug),
    metaTag: buildMetaTag(site.slug),
    reachable: true,
    verifiedAt: site.verifiedAt?.toISOString() ?? null,
    panelOrigin,
  };
}

async function checkReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'ITM-Panel-Connect/1.0' },
    });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'site';
  let attempt = 0;
  while (attempt < 5) {
    const existing = await db.site.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${randomBytes(2).toString('hex')}`;
    attempt += 1;
  }
  return `${base}-${Date.now()}`;
}

export async function listSitesByTenant(tenantId: string, panelOrigin?: string) {
  const origin = panelOrigin ?? getApiOrigin();
  const sites = await db.site.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return sites.map((site) => toConnectionResult(site, origin));
}

export async function connectSiteFromUrl(
  rawUrl: string,
  tenantId: string,
  panelOrigin?: string
): Promise<SiteConnectionResult & { reachable: boolean }> {
  const origin = panelOrigin ?? getApiOrigin();
  const url = normalizeUrl(rawUrl);
  const reachable = await checkReachable(url);

  const existing = await db.site.findFirst({
    where: { tenantId, url },
  });
  if (existing) {
    return { ...toConnectionResult(existing, origin), reachable };
  }

  const slug = await uniqueSlug(urlToSlug(url));
  const site = await db.site.create({
    data: {
      slug,
      name: siteNameFromUrl(url),
      url,
      apiKey: randomBytes(24).toString('hex'),
      tenantId,
      status: 'pending',
    },
  });

  return { ...toConnectionResult(site, origin), reachable };
}

export async function activateSite(slug: string, apiKey: string) {
  const site = await db.site.findUnique({ where: { slug } });
  if (!site || site.apiKey !== apiKey) return null;

  return db.site.update({
    where: { slug },
    data: {
      status: 'connected',
      verifiedAt: new Date(),
    },
  });
}

export async function verifySiteInstallation(slug: string) {
  const site = await db.site.findUnique({ where: { slug } });
  if (!site || !site.url) return { ok: false as const, reason: 'not_found' as const };

  try {
    const res = await fetch(site.url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'ITM-Panel-Connect/1.0' },
    });
    const html = await res.text();
    const hasScript =
      html.includes(`/api/connect/${slug}`) || html.includes(`content="${slug}"`);
    if (hasScript) {
      const updated = await db.site.update({
        where: { slug },
        data: { status: 'connected', verifiedAt: new Date() },
      });
      return { ok: true as const, site: updated };
    }
    return { ok: false as const, reason: 'script_missing' as const };
  } catch {
    return { ok: false as const, reason: 'unreachable' as const };
  }
}

export async function getSiteByApiKey(apiKey: string) {
  return db.site.findUnique({ where: { apiKey } });
}

/**
 * Generates the self-contained JS subscription widget for a given channel.
 * When `widgetToken` is provided, the opaque token is embedded in the JS
 * instead of the real `channelId`, preventing exposure in public HTML source
 * and browser dev tools.
 */
export function buildSubscribeWidget(
  panelOrigin: string,
  channelId: string,
  siteSlug?: string,
  widgetToken?: string
): string {
  const PO = panelOrigin.replace(/</g, '\\x3c').replace(/>/g, '\\x3e');
  const CID = channelId.replace(/</g, '\\x3c').replace(/>/g, '\\x3e');
  const TOKEN = widgetToken
    ? widgetToken.replace(/</g, '\\x3c').replace(/>/g, '\\x3e')
    : '';
  const SITE = siteSlug ? siteSlug.replace(/</g, '\\x3c').replace(/>/g, '\\x3e') : '';

  // Use token-based auth when available; fall back to channelId for
  // backward compatibility with existing embedded scripts.
  const authVar = TOKEN ? `,T="${TOKEN}"` : `,C="${CID}"`;
  const authFields = TOKEN ? `token:T` : `channelId:C`;

  return `(function(){
` +
    `var P="${PO}"${authVar}` +
    (SITE
      ? `,S="${SITE}"`
      : `,S=(function(){try{return window.location.hostname.replace(/^www./i,"").replace(/[^a-z0-9]+/gi,"-").toLowerCase();}catch(e){return""}})()`) +
    `;
` +
    `var CONSENT_VER="v1-2026-07";
` +
    `var w=document.currentScript||document.querySelector('script[src*="widgets/subscribe"]');
` +
    `if(!w)return;
` +
    `function parseUtm(){var o={},q="";try{q=window.location.search||""}catch(e){}if(!q)return o;q.replace(/^\\?/,"").split("&").forEach(function(p){var kv=p.split("=");if(kv.length<2)return;var k=decodeURIComponent(kv[0]||""),v=decodeURIComponent((kv[1]||"").replace(/\\+/g," "));if(k.indexOf("utm_")==0&&v)o[k.slice(4)]=v;});return o;}
` +
    `function collectContext(){var utm=parseUtm(),ctx={siteSlug:S||undefined,pageUrl:undefined,referrer:undefined,utm:utm};try{ctx.pageUrl=window.location.href}catch(e){}try{ctx.referrer=document.referrer||undefined}catch(e){}return ctx;}
` +
    `function collectTechnical(){var t={};try{t.language=navigator.language}catch(e){}try{t.timezone=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){}try{t.userAgent=navigator.userAgent}catch(e){}return t;}
` +
    `var d=document.createElement("div");
` +
    `d.className="itm-subscribe-widget";
` +
    `d.innerHTML='<style>'+
` +
    `'.itm-subscribe-widget{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:380px;margin:0 auto;text-align:left}'+
` +
    `'.itm-subscribe-widget *{box-sizing:border-box}'+
` +
    `'.itm-sub-form{display:flex;flex-direction:column;gap:10px}'+
` +
    `'.itm-sub-row{display:flex;gap:8px;flex-wrap:wrap}'+
` +
    `'.itm-sub-input{flex:1 1 200px;min-width:0;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:10px;font-size:15px;outline:none;transition:border-color .2s;background:#fff;color:#111827}'+
` +
    `'.itm-sub-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.15)}'+
` +
    `'.itm-sub-input::placeholder{color:#9ca3af}'+
` +
    `'.itm-sub-btn{flex-shrink:0;padding:10px 22px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:background .2s,transform .1s}'+
` +
    `'.itm-sub-btn:hover{background:#2563eb}'+
` +
    `'.itm-sub-btn:active{transform:scale(.97)}'+
` +
    `'.itm-sub-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}'+
` +
    `'.itm-sub-consent{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.45;color:#4b5563}'+
` +
    `'.itm-sub-consent input{margin-top:2px;flex-shrink:0}'+
` +
    `'.itm-sub-success{color:#059669;font-weight:500;font-size:15px;padding:12px 0}'+
` +
    `'.itm-sub-error{color:#ef4444;font-size:14px;padding:4px 0}'+
` +
    `'.itm-sub-msg{font-size:13px;min-height:24px;padding-top:6px}'+
` +
    `'</style>'+
` +
    `'<form class="itm-sub-form">'+
` +
    `'<div class="itm-sub-row">'+
` +
    `'<input class="itm-sub-input" type="email" placeholder="votre@email.com" required autocomplete="email">'+
` +
    `'<button class="itm-sub-btn" type="submit">S\\'abonner</button>'+
` +
    `'</div>'+
` +
    `'<label class="itm-sub-consent"><input type="checkbox" class="itm-sub-consent-cb" required>'+
` +
    `'<span>J\\'accepte de recevoir la newsletter et la politique de confidentialit\u00e9.</span></label>'+
` +
    `'</form>'+
` +
    `'<div class="itm-sub-msg"></div>';
` +
    `w.parentNode.insertBefore(d,w.nextSibling);
` +
    `var f=d.querySelector('.itm-sub-form');
` +
    `var msg=d.querySelector('.itm-sub-msg');
` +
    `var btn=f.querySelector('.itm-sub-btn');
` +
    `var inp=f.querySelector('.itm-sub-input');
` +
    `var cb=f.querySelector('.itm-sub-consent-cb');
` +
    `f.addEventListener('submit',function(e){
` +
    `e.preventDefault();
` +
    `var email=inp.value.trim();
` +
    `if(!email)return;
` +
    `if(!cb.checked){msg.innerHTML='<span style="color:#ef4444">Veuillez accepter pour continuer.</span>';return;}
` +
    `btn.disabled=true;
` +
    `btn.textContent='Envoi\u2026';
` +
    `msg.innerHTML='';
` +
    `var payload={email:email,${authFields},siteSlug:S||undefined,consent:{newsletter:true,privacyAccepted:true,textVersion:CONSENT_VER},context:collectContext(),technical:collectTechnical()};
` +
    `fetch(P+'/api/public/subscribe',{
` +
    `method:'POST',
` +
    `headers:{'Content-Type':'application/json'},
` +
    `body:JSON.stringify(payload)
` +
    `}).then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d}})})
` +
    `.then(function(r){
` +
    `btn.disabled=false;
` +
    `btn.textContent='S\\'abonner';
` +
    `if(r.ok){
` +
    `f.style.display='none';
` +
    `msg.innerHTML='<div class="itm-sub-success">Merci ! Vous \u00eates abonn\u00e9(e).</div>';
` +
    `}else{
` +
    `msg.innerHTML='<span style="color:#ef4444">'+(r.data.error||'Erreur')+'</span>';
` +
    `}
` +
    `}).catch(function(err){
` +
    `btn.disabled=false;
` +
    `btn.textContent='S\\'abonner';
` +
    `msg.innerHTML='<span style="color:#ef4444">Erreur r\u00e9seau. R\u00e9essayez.</span>';
` +
    `});
` +
    `});
` +
    `})();`;
}

export function buildConnectScript(panelOrigin: string, slug: string, apiKey: string): string {
  return `(function(){
  var P="${panelOrigin.replace(/"/g, '\\"')}";
  var S="${slug.replace(/"/g, '\\"')}";
  var K="${apiKey.replace(/"/g, '\\"')}";
  window.ITM={panelUrl:P,siteSlug:S,apiKey:K};
  function api(p){return P+p;}
  function headers(){return{"Content-Type":"application/json","X-Api-Key":K};}
  window.ITM.fetchContent=function(type){
    var q=type?"&type="+encodeURIComponent(type):"";
    return fetch(api("/api/public/content?site="+encodeURIComponent(S)+q)).then(function(r){return r.json();});
  };
  window.ITM.fetchOne=function(id){
    return fetch(api("/api/public/content/"+encodeURIComponent(id))).then(function(r){return r.json();});
  };
  window.ITM.trackView=function(id){
    return fetch(api("/api/track/view"),{method:"POST",headers:headers(),body:JSON.stringify({contentId:id,siteId:S})});
  };
  window.ITM.trackClick=function(id,link){
    return fetch(api("/api/track/click"),{method:"POST",headers:headers(),body:JSON.stringify({contentId:id,siteId:S,linkUrl:link||""})});
  };
  window.ITM.renderFeed=function(el,type){
    if(typeof el==="string")el=document.querySelector(el);
    if(!el)return;
    window.ITM.fetchContent(type).then(function(d){
      el.innerHTML="";
      (d.content||[]).forEach(function(item){
        var a=document.createElement("a");
        a.href="#itm-"+item.id;
        a.className="itm-feed-item";
        a.innerHTML="<strong>"+item.title+"</strong><p>"+(item.excerpt||"")+"</p>";
        a.addEventListener("click",function(e){e.preventDefault();window.ITM.trackClick(item.id,a.href);});
        el.appendChild(a);
      });
    });
  };
  fetch(api("/api/sites/"+encodeURIComponent(S)+"/activate"),{method:"POST",headers:headers(),body:"{}"}).catch(function(){});
  document.querySelectorAll("[data-itm-feed]").forEach(function(el){
    window.ITM.renderFeed(el,el.getAttribute("data-itm-type")||undefined);
  });
})();`;
}
