'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import Image from 'next/image';
import { Badge } from '../ui/badge';

const solutions = [
  {
    title: 'Compliant Documents',
    description: 'Generate fully compliant Risk Assessments, Method Statements, and CDM documents tailored to your project specifics.',
    image: 'https://picsum.photos/300/200',
    imageHint: 'document icon',
  },
  {
    title: 'Instant Generation',
    description: 'Our AI drafts your critical documents in minutes, not hours, freeing up your team to focus on site operations.',
    image: 'https://picsum.photos/300/200',
    imageHint: 'robot time',
  },
  {
    title: 'Editable & Shareable',
    description: 'Receive documents in editable formats (.doc), ready for final review, team collaboration, and distribution.',
    image: 'https://picsum.photos/300/200',
    imageHint: 'collaboration tools',
  },
];

export function SolutionsSection() {
  return (
    <SectionWrapper id="solutions">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="border-primary/50 text-primary mb-4">
          Solutions
        </Badge>
        <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Smart tools for faster safety & compliance
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Our AI-powered agents qualify risks, handle compliance checks, and generate documents instantly.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-none grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
        {solutions.map((solution) => (
          <Card key={solution.title} className="flex flex-col overflow-hidden bg-card border-white/10 shadow-e1 rounded-xl">
            <div className="relative h-48 w-full">
              <Image
                src={solution.image}
                alt={solution.title}
                data-ai-hint={solution.imageHint}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-xl font-bold">{solution.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{solution.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}