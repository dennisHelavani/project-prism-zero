import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";

const partners = [
  { name: "Partner 1", logo: "/logo-placeholder.svg" },
  { name: "Partner 2", logo: "/logo-placeholder.svg" },
  { name: "Partner 3", logo: "/logo-placeholder.svg" },
  { name: "Partner 4", logo: "/logo-placeholder.svg" },
  { name: "Partner 5", logo: "/logo-placeholder.svg" },
];

export function PartnersSection() {
  return (
    <SectionWrapper className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-foreground">
          Trusted by the world’s most innovative teams
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
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
