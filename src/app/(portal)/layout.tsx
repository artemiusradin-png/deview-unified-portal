import { PortalShell } from "@/components/PortalShell";
import { getServerSession } from "@/lib/auth-session";
import { isAdminRole } from "@/lib/rbac";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const isAdmin = Boolean(session && isAdminRole(session.role));

  return <PortalShell isAdmin={isAdmin}>{children}</PortalShell>;
}
