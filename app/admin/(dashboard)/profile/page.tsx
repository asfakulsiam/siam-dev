import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getProfile } from "@/features/profile/queries";
import { ProfileManager } from "@/components/admin/ProfileManager";
import { staticProfile } from "@/features/profile/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile & Now | Dev Den Admin",
  description: "Update personal narrative, bio, availability status, and toolbox items.",
};

export default async function AdminProfilePage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  let profile = await getProfile().catch(() => null);
  if (!profile) {
    profile = staticProfile;
  }

  return <ProfileManager initialProfile={profile} />;
}
