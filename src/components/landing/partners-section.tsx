'use client';
import { SectionWrapper } from "./section-wrapper";
import { LogoLoop } from '../ui/logo-loop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiVercel, SiGithub } from 'react-icons/si';

const techLogos = [
  { node: <SiReact size="48"/>, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs size="48"/>, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript size="48"/>, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss size="48"/>, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiVercel size="48"/>, title: "Vercel", href: "https://vercel.com" },
  { node: <SiGithub size="48"/>, title: "GitHub", href: "https://github.com" },
];


export function PartnersSection() {
  return (
    <SectionWrapper className="py-16">
        <h2 className="text-center text-lg font-semibold leading-8 text-foreground mb-12">
          Partenrs We Work With
        </h2>
        <div style={{ height: '48px', position: 'relative', overflow: 'hidden'}}>
            <LogoLoop
                logos={techLogos}
                speed={80}
                direction="left"
                logoHeight={48}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                ariaLabel="Technology partners"
            />
        </div>
    </SectionWrapper>
  );
}
