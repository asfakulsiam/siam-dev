import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

export const metadata = {
  title: "Admin Sign In | Dev Den",
  description: "Sign in to manage Dev Den portfolio content, projects, and messages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg)] text-[var(--ink)] transition-colors relative"
    >
      {/* Theme Switcher in top right */}
      <div className="absolute top-6 right-6">
        <ThemeSwitcher />
      </div>

      <AdminLoginForm />
    </main>
  );
}
