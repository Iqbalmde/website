// @ts-nocheck -- server helper; inputs validated at runtime
import { createHash, timingSafeEqual } from "node:crypto";

const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s: string) => {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

async function hmacKey() {
  const secret = process.env["ADMIN_JWT_SECRET"];
  if (!secret) throw new Error("Server not configured");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signJwt(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const p = b64u(enc.encode(JSON.stringify({ email, iat: now, exp: now + 8 * 3600 })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(sig)}`;
}

export async function verifyJwt(token: unknown): Promise<string> {
  if (typeof token !== "string") throw new Error("Unauthorized");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Unauthorized");
  const [h, p, s] = parts;
  const header = JSON.parse(new TextDecoder().decode(fromB64u(h)));
  if (header.alg !== "HS256") throw new Error("Unauthorized");
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64u(s), enc.encode(`${h}.${p}`));
  if (!ok) throw new Error("Unauthorized");
  const payload = JSON.parse(new TextDecoder().decode(fromB64u(p)));
  if (!payload.exp || payload.exp < Date.now() / 1000) throw new Error("Unauthorized");
  if (typeof payload.email !== "string" || !payload.email.toLowerCase().endsWith("@zelantrix.com")) throw new Error("Unauthorized");
  return payload.email;
}

export function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/* ---------- AI (Lovable AI Gateway, Responses API, streamed) ---------- */
export async function aiText(input: unknown, format?: Record<string, unknown>): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      ...(format ? { text: { format } } : {}),
    }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 429) throw new Error("AI is busy. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are used up.");
    throw new Error("AI request failed.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") out += ev.delta;
      } catch { /* ignore */ }
    }
  }
  return out.trim();
}

/* ---------- Title detection ---------- */
function isBlockedHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (h.includes(":")) return h === "::1" || h === "::" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80") || h.startsWith("::ffff:");
  if (/^\d+$/.test(h) || /^0x/.test(h)) return true;
  return false;
}

export function checkUrl(raw: string): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("Enter a valid https link."); }
  if (u.protocol !== "https:") throw new Error("Only https links are allowed.");
  if (u.username || u.password || (u.port && u.port !== "443")) throw new Error("This link is not allowed.");
  if (isBlockedHost(u.hostname)) throw new Error("This link is not allowed.");
  return u;
}

const decodeEntities = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();

function meta(html: string, attr: string, name: string) {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${name}["']`, "i");
  const m = html.match(re1) || html.match(re2);
  return m ? decodeEntities(m[1]) : "";
}

async function fetchCapped(start: URL): Promise<string> {
  let url = start;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    for (let hop = 0; hop < 4; hop++) {
      const res = await fetch(url.toString(), { redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": "ZelantrixBot/1.0", Accept: "text/html,*/*" } });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = checkUrl(new URL(res.headers.get("location")!, url).toString());
        continue;
      }
      if (!res.ok || !res.body) throw new Error("Could not read that link.");
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2 * 1024 * 1024) { await reader.cancel(); break; }
        chunks.push(value);
      }
      const all = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
      let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
      return new TextDecoder().decode(all);
    }
    throw new Error("Too many redirects.");
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new Error("That link took too long to load.");
    throw e;
  } finally { clearTimeout(timer); }
}

export async function titleFromUrl(raw: string): Promise<{ url: string; title: string }> {
  const u = checkUrl(raw.trim());
  const html = await fetchCapped(u);
  const citation = meta(html, "name", "citation_title");
  const og = meta(html, "property", "og:title");
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = citation || og || (t ? decodeEntities(t[1]) : "");
  if (u.hostname.endsWith("arxiv.org") && !citation) title = title.replace(/^\[[^\]]+\]\s*/, "");
  if (!title) {
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000);
    try {
      title = await aiText(`Write a short, accurate title (max 14 words) for this research page. Return only the title.\n\n${text}`);
    } catch { /* fall through */ }
  }
  return { url: u.toString(), title: (title || u.hostname).slice(0, 300) };
}

export async function titleFromPdf(signedUrl: string, fileName: string): Promise<string> {
  const fallback = fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Untitled PDF";
  try {
    const t = await aiText([
      {
        role: "user",
        content: [
          { type: "input_file", file_url: signedUrl },
          { type: "input_text", text: "Read the first page of this paper and return only its exact title. No quotes, no extra text." },
        ],
      },
    ]);
    return (t.replace(/^["“]|["”]$/g, "").trim() || fallback).slice(0, 300);
  } catch {
    return fallback;
  }
}
