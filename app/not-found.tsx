import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { getMeme } from "@/features/appearance/queries";
import { MemeState } from "@/components/motion/MemeState";

export default async function NotFound() {
  const notFoundMeme = await getMeme("notFound");

  return (
    <main id="main-content" className="min-h-screen flex flex-col justify-center pt-24 pb-20">
      <Section spacing="compact">
        <Container size="narrow" className="text-center space-y-6">
          <div className="flex justify-center">
            <MemeState asset={notFoundMeme} maxLoops={3} />
          </div>

          <Heading as="h1" size="4xl">
            Page not found
          </Heading>
          <Text size="lg" variant="muted" className="max-w-md mx-auto text-pretty">
            The page or project you requested could not be located. It may have been moved or
            archived.
          </Text>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/">
              <Button variant="primary" size="md">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Return Home</span>
              </Button>
            </Link>
            <Link href="/work">
              <Button variant="outline" size="md">
                Explore Selected Work
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
