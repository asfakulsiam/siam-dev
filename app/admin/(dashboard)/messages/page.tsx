import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getContactMessages } from "@/features/contact/queries";
import { MessagesManager } from "@/components/admin/MessagesManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inquiries & Messages | Dev Den Admin",
  description: "View and manage incoming contact inquiries and collaboration requests.",
};

export default async function AdminMessagesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const messages = await getContactMessages().catch(() => []);

  return <MessagesManager initialMessages={messages} />;
}
