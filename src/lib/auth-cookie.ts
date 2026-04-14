export const SESSION_COOKIE = "deview_session";

export function getExpectedPassword(): string {
  return process.env.PORTAL_DEMO_PASSWORD ?? "deview-demo";
}
