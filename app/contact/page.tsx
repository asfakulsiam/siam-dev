import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { DirectContactCard } from "@/features/contact/components/DirectContactCard";
import { getSettings } from "@/features/appearance/queries";
import { getProfile } from "@/features/profile/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Get in Touch & Inquiries",
  description:
    "Send an inquiry or project proposal to Asfakul. Available for select web engineering, design systems, and frontend architecture contracts.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Get in Touch | Asfakul — Dev Den",
    description:
      "Send an inquiry or project proposal to Asfakul. Available for select web engineering and design contracts.",
    url: `${siteConfig.url}/contact`,
    type: "website",
    images: [
      {
        url: "/api/og?title=Get+in+Touch&category=Direct+Inquiry&description=Available+for+select+web+engineering%2C+design+systems%2C+and+frontend+architecture+contracts.",
        width: 1200,
        height: 630,
        alt: "Contact Asfakul OpenGraph Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get in Touch | Asfakul — Dev Den",
    description:
      "Send an inquiry or project proposal to Asfakul. Available for select web engineering and design contracts.",
    images: [
      "/api/og?title=Get+in+Touch&category=Direct+Inquiry&description=Available+for+select+web+engineering%2C+design+systems%2C+and+frontend+architecture+contracts.",
    ],
  },
};

export default async function ContactPage() {
  const [settings, profile] = await Promise.all([
    getSettings(),
    getProfile(),
  ]);

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20">
      <Section spacing="compact">
        <Container className="space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-[var(--line)] pb-8 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Inquiries & Contracts</Badge>
              <span className="text-xs text-[var(--ink-muted)] font-mono">
                Asia/Dhaka · GMT+6
              </span>
            </div>
            <Heading as="h1" size="4xl" className="tracking-tight">
              Let&apos;s build something considered.
            </Heading>
            <Text size="lg" variant="muted" className="text-pretty leading-relaxed">
              Available for full-time roles, design system consultations, and select frontend
              architecture contracts. Drop a direct message or send a note below.
            </Text>
          </div>

          {/* Contact Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Direct Information & Timezone Card */}
            <div className="lg:col-span-5 space-y-6">
              <DirectContactCard profile={profile} />
            </div>

            {/* Interactive Form Card */}
            <div className="lg:col-span-7 p-6 sm:p-10 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] shadow-xs">
              <div className="space-y-2 mb-8">
                <Heading as="h2" size="2xl">
                  Send a Direct Message
                </Heading>
                <Text size="sm" variant="muted">
                  Fill out the form below. I typically reply within 24–48 hours on business days.
                </Text>
              </div>

              <ContactForm memes={settings.memes} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
