import { CtaButton } from "@/components/ui/cta-button";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[980px] px-6 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl" style={{lineHeight: 1.1}}>
          Turn hours of construction paperwork into seconds.
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          AI-powered HSE & CDM documents delivered in minutes — editable, compliant, ready to send.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <CtaButton asChild>
            <Link href="#cta">
              <Command />
              Get my documents
            </Link>
          </CtaButton>
          <Button variant="link" asChild>
            <Link href="#how-it-works">How it works &rarr;</Link>
          </Button>
        </div>
      </div>
      <div className="mt-16 sm:mt-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flow-root">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="https://picsum.photos/1200/768"
                alt="App screenshot"
                data-ai-hint="document preview"
                width={2432}
                height={1442}
                className="rounded-md shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
