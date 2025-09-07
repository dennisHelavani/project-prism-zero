
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { MotionDiv } from '../ui/motion-div';

const liveTemplates = [
  { 
    name: 'RAMS', 
    desc: 'Comprehensive Risk Assessment Method Statements generated from a short form.',
    cta_label: "See sample",
    href: "#sample-rams"
  },
  { 
    name: 'Construction Phase Plan (CPP)', 
    desc: 'Full plan drafted from your inputs and delivered branded by email.',
    cta_label: "See sample",
    href: "#sample-cpp"
  },
];

const comingSoonTemplates = [
  { name: 'Method Statements', desc: 'Step-by-step safe work procedures.', cta_label: "See sample", href: "#sample-ms" },
  { name: 'Risk Assessments', desc: 'Identify and mitigate hazards effectively.', cta_label: "See sample", href: "#sample-ra" },
  { name: 'COSHH', desc: 'Compliant assessments for hazardous substances.', cta_label: "See sample", href: "#sample-coshh" },
  { name: 'Daily Briefings', desc: 'Automate daily safety meeting documentation.', cta_label: "See sample", href: "#sample-dbrief" },
  { name: 'Toolbox Talks', desc: 'Generate relevant safety talks in minutes.', cta_label: "See sample", href: "#sample-tbt" },
  { name: 'Safety Checklists', desc: 'Ensure key checks are completed and logged.', cta_label: "See sample", href: "#sample-checks" },
  { name: 'ITPs', desc: 'Inspection & Test Plans for quality assurance.', cta_label: "See sample", href: "#sample-itp" }
];

const fromLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 }};
const fromRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 }};

export function UseCasesSection() {
  return (
    <SectionWrapper id="templates">
      <MotionDiv>
        <div className="mx-auto max-w-3xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground glowing-text justify-center"
            text="Templates & Use-Cases"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From safety compliance to daily site operations—we’ve got you covered.
          </p>
        </div>
      </MotionDiv>

      <div className="mt-12 md:mt-16 space-y-16">
        
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
              {liveTemplates.map((item, index) => (
                 <MotionDiv 
                    key={item.name} 
                    variants={index === 0 ? fromLeft : fromRight} 
                    transition={{ duration: 0.7, delay: 0.2 }}
                 >
                    <Card className="flex flex-col border-white/10 shadow-e1 rounded-xl p-6 h-full" style={{
                      background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--secondary)))",
                    }}>
                      <CardHeader className="p-0">
                        <CardTitle className="font-headline text-xl font-bold">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2 flex-grow">
                        <p className="text-muted-foreground">{item.desc}</p>
                      </CardContent>
                      <div className="mt-4">
                        <Button asChild variant="ghost" className="p-0 h-auto text-primary">
                          <Link href={item.href}>
                            {item.cta_label} <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        
        
        <MotionDiv delay={0.4}>
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary mb-8 text-center">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {comingSoonTemplates.map((item) => (
                <Card key={item.name} className="flex flex-col border-[#FABE2C]/50 shadow-e1 rounded-xl p-6 bg-card/50">
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl font-bold">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2 flex-grow">
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </MotionDiv>
      </div>
    </SectionWrapper>
  );
}
