import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";

const partners = [
  { name: "VAPI", logo: "/vapi.svg" },
  { name: "Voiceflow", logo: "/voiceflow.svg" },
  { name: "Make", logo: "/make.svg" },
  { name: "n8n", logo: "/n8n.svg" },
  { name: "Zapier", logo: "/zapier.svg" },
  { name: "OpenAI", logo: "/openai.svg" },
];

export function PartnersSection() {
  return (
    <SectionWrapper className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-foreground">
          Partners we work with
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6">
          {partners.map((partner) => (
            <Image
              key={partner.name}
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src={partner.logo}
              alt={partner.name}
              width={158}
              height={48}
              unoptimized
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
