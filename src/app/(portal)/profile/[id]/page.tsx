import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/mock-data";
import { ProfileModules } from "@/components/ProfileModules";

type Props = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = getProfileById(id);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        ← Back to search
      </Link>
      <div className="mt-4">
        <ProfileModules profile={profile} />
      </div>
    </div>
  );
}
