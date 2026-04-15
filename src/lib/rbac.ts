export function isAdminRole(role: string): boolean {
  return role === "ADMIN";
}

export function isStaffOrAbove(role: string): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/** VIEWER may see masked operational data; staff+ see financial modules in full where wired. */
export function canViewSensitiveFinancial(role: string): boolean {
  return role === "ADMIN" || role === "STAFF";
}
