
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

const safetyPack = [
  { title: 'RAMS', description: 'Comprehensive Risk Assessment Method Statements.' },
  { title: 'Method Statements', description: 'Detailed, step-by-step safe work procedures.' },
  { title: 'Risk Assessments', description: 'Identify and mitigate hazards effectively.' },
  { title: 'COSHH', description: 'Manage hazardous substances with compliant assessments.' },
];

const sitePack = [
  { title: 'Daily Briefings', description: 'Automate daily safety meeting documentation.' },
  { title: 'Toolbox Talks', description: 'Generate engaging, relevant safety talks in minutes.' },
  { title: 'Safety Checklists', description: 'Ensure all safety checks are completed and logged.' },
  { title: 'ITPs', description: 'Create Inspection and Test Plans for quality assurance.' },
];

export function UseCasesSection() {
  return (
    <SectionWrapper id="solutions">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl glowing-text">
          Templates & Use-Cases
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          From safety compliance to daily site operations, we've got you covered.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        <div>
          <h3 className="font-headline text-2xl font-bold text-primary mb-8 text-center">Safety Pack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyPack.map((item) => (
              <Card key={item.title} className="flex flex-col bg-card border-white/10 shadow-e1 rounded-xl p-6">
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-xl font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2 flex-grow">
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
                <div className="mt-4">
                  <Button variant="ghost" className="p-0 h-auto text-primary">
                    See sample <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-headline text-2xl font-bold text-primary mb-8 text-center">Site Pack</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sitePack.map((item) => (
              <Card key={item.title} className="flex flex-col bg-card border-white/10 shadow-e1 rounded-xl p-6">
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-xl font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2 flex-grow">
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
                 <div className="mt-4">
                  <Button variant="ghost" className="p-0 h-auto text-primary">
                    See sample <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
