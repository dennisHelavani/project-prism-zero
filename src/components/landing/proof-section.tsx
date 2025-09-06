
'use client';
import { SectionWrapper } from "./section-wrapper";
import { LogoLoop } from '../ui/logo-loop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiVercel, SiGithub } from 'react-icons/si';
import { Card } from "../ui/card";

const techLogos = [
  { node: <SiReact size="48"/>, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs size="48"/>, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript size="48"/>, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss size="48"/>, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiVercel size="48"/>, title: "Vercel", href: "https://vercel.com" },
  { node: <SiGithub size="48"/>, title: "GitHub", href: "https://github.com" },
];

const stats = [
    { value: '90%', label: 'Faster approvals' },
    { value: '75%', label: 'Fewer reworks' },
    { value: '5k+', label: 'Docs/month automated' },
]

export function ProofSection() {
  return (
    <SectionWrapper id="proof" className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
            <h2 className="text-center lg:text-left text-lg font-semibold leading-8 text-foreground mb-12">
            Partners we work with
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
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map(stat => (
                <Card key={stat.label} className="p-4 text-center bg-card/50 border-white/10">
                    <p className="text-4xl font-bold text-primary glowing-text">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
            ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
