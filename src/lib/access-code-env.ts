import {
  obfuscatedPortalAccessCodeKey,
  pickFromEnvBag,
  readEnvViaDynamicEval,
} from "@/lib/session-secret-shared";

export const PORTAL_ACCESS_CODE_KEYS = [
  ...new Set([["PORTAL", "ACCESS", "CODE"].join("_"), obfuscatedPortalAccessCodeKey()]),
];

/** Edge-safe: no `node:process` import. */
export function readPortalAccessCodeFromEnv(): string | undefined {
  const fromProcess = pickFromEnvBag(process.env as Record<string, string | undefined>, PORTAL_ACCESS_CODE_KEYS);
  if (fromProcess) return fromProcess;

  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  const fromGlobal = pickFromEnvBag(g.process?.env, PORTAL_ACCESS_CODE_KEYS);
  if (fromGlobal) return fromGlobal;

  return readEnvViaDynamicEval(
    "return typeof process !== 'undefined' && process.env ? process.env['PORTAL' + '_' + 'ACCESS' + '_' + 'CODE'] : undefined",
  );
}
