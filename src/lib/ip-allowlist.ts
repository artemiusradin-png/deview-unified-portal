/** Parse IPv4 to32-bit unsigned (big-endian). */
function ipv4ToInt(ip: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip.trim());
  if (!m) return null;
  const parts = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (parts.some((p) => p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function matchCidr(clientIp: string, rule: string): boolean {
  const [base, bitsRaw] = rule.split("/").map((s) => s.trim());
  const bits = Number(bitsRaw);
  const ipNum = ipv4ToInt(clientIp);
  const baseNum = ipv4ToInt(base);
  if (ipNum === null || baseNum === null || !Number.isFinite(bits) || bits < 0 || bits > 32) {
    return false;
  }
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (ipNum & mask) === (baseNum & mask);
}

/** Comma-separated rules: exact IPv4 or CIDR (e.g. 203.0.113.10, 10.0.0.0/8). Empty = allow all. */
export function isClientIpAllowed(clientIp: string, rulesFromEnv: string | undefined): boolean {
  const rules =
    rulesFromEnv
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  if (rules.length === 0) return true;
  const ip = clientIp.trim();
  if (!ip || ip === "unknown") return false;
  return rules.some((rule) => {
    if (rule.includes("/")) return matchCidr(ip, rule);
    return rule === ip;
  });
}
