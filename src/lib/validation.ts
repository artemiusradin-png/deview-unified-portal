const CUSTOMER_ID = /^cust-[a-z0-9-]{1,64}$/i;

export function isValidCustomerId(id: unknown): id is string {
  return typeof id === "string" && CUSTOMER_ID.test(id);
}

export function clampSearchQuery(q: string, max = 200): string {
  return q.slice(0, max);
}
