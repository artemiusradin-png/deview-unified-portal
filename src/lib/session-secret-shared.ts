export function normalizeEnvString(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}

/** Avoid bundlers rewriting a literal env key in `process.env.*`. */
export function obfuscatedPortalAccessCodeKey(): string {
  return String.fromCharCode(
    80, 79, 82, 84, 65, 76, 95, 65, 67, 67, 69, 83, 83, 95, 67, 79, 68, 69,
  );
}

export function pickFromEnvBag(
  bag: Record<string, string | undefined> | undefined,
  keys: string[],
): string | undefined {
  if (!bag) return undefined;
  for (const k of keys) {
    const raw = bag[k];
    if (typeof raw === "string") {
      const t = normalizeEnvString(raw);
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

/**
 * Evaluate env lookup at request time (string is not parsed as source by DefinePlugin).
 */
export function readEnvViaDynamicEval(getterSource: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func -- Vercel: avoid build-time env snapshot
    const v = new Function(getterSource)() as unknown;
    if (typeof v !== "string") return undefined;
    const t = normalizeEnvString(v);
    return t.length > 0 ? t : undefined;
  } catch {
    return undefined;
  }
}
