import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getTestimonials } from "@/features/testimonials/queries";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Endorsements & Testimonials | Dev Den Admin",
  description: "Manage client and colleague recommendations.",
};

export default async function AdminTestimonialsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  // Fetch all testimonials including drafts for admin view
  const testimonials = await getTestimonials(false).catch(() => []);

  return <TestimonialsManager initialTestimonials={testimonials} />;
}
