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
