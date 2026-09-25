import { requireAdmin } from "@/lib/auth-guard";
import { getSettings } from "@/features/appearance/queries";
import { AppearanceManager } from "@/components/admin/AppearanceManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Appearance & Memes | Admin Dashboard",
  description: "Manage default theme, brand appearance, and comic reaction memes.",
};

export default async function AdminAppearancePage() {
  await requireAdmin();
  const settings = await getSettings();

  return <AppearanceManager initialSettings={settings} />;
}
