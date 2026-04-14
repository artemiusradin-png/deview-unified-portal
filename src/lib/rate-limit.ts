type Entry = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

const store = new Map<string, Entry>();

function prune(now: number) {
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

export function checkLoginRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  let e = store.get(ip);
  if (!e || now > e.resetAt) {
    e = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, e);
  }
  if (e.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((e.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  let e = store.get(ip);
  if (!e || now > e.resetAt) {
    e = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, e);
  }
  e.count += 1;
}

export function clearLoginFailures(ip: string) {
  store.delete(ip);
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
