export function normalizeEnvString(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}
