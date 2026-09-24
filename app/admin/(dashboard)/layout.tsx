import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getContactMessages } from "@/features/contact/queries";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Dev Den",
  description: "Dev Den Portfolio CMS and Administration",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  // Fetch unread count for the navigation badge
  let unreadCount = 0;
  try {
    const messages = await getContactMessages();
    unreadCount = messages.filter((m) => m.status === "unread").length;
  } catch {
    unreadCount = 0;
  }

  return (
    <AdminDashboardShell unreadMessagesCount={unreadCount}>
      {children}
    </AdminDashboardShell>
  );
}
