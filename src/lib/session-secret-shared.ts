export function normalizeEnvString(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}

/** Avoid bundlers rewriting a literal `SESSION_SECRET` token in `process.env.*`. */
export function obfuscatedSessionSecretKey(): string {
  return String.fromCharCode(83, 69, 83, 83, 73, 79, 78, 95, 83, 69, 67, 82, 69, 84);
}

export function obfuscatedPortalPasswordKey(): string {
  return String.fromCharCode(
    80, 79, 82, 84, 65, 76, 95, 68, 69, 77, 79, 95, 80, 65, 83, 83, 87, 79, 82, 68,
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
 * eslint-disable-next-line @typescript-eslint/no-implied-eval -- intentional runtime env read on Vercel
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
