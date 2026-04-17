import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { getProfileById } from "@/lib/portal-data";
import { ProfileModules } from "@/components/ProfileModules";

type Props = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const session = await getServerSession();
  const h = await headers();
  await writeAudit({
    userId: session?.userId,
    action: "profile.view",
    resource: id,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        <span className="lang-en">← Back to search</span>
        <span className="lang-zh">← 返回搜尋</span>
      </Link>
      <div className="mt-4">
        <ProfileModules profile={profile} />
      </div>
    </div>
  );
}
