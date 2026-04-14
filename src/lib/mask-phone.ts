/** Discovery brief: show only leading digits in some views (e.g. first 4 of national number). */
export function maskPhoneDisplay(mobile: string, visibleLeading = 4): string {
  const d = mobile.replace(/\s/g, "");
  if (d.length <= visibleLeading) return "••••";
  const head = d.slice(0, visibleLeading);
  return `${head}${"•".repeat(Math.min(8, d.length - visibleLeading))}`;
}

/** Mask phone-like strings; leave emails and other text unchanged. */
export function maskContactDisplay(contact: string): string {
  const t = contact.trim();
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 8 && /^[\d\s+()-]+$/.test(t)) {
    return maskPhoneDisplay(t.replace(/\s/g, ""), 4);
  }
  return t;
}
