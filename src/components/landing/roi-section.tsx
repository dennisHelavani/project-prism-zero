
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "./section-wrapper";
import { TrendingUp, Zap, ShieldCheck, CheckCircle } from "lucide-react";
import { AnimatedCounter } from "../ui/animated-counter";

const stats = [
    { 
        icon: <TrendingUp className="w-10 h-10 text-primary" />,
        value: 400,
        prefix: "+",
        label: "Hours Saved/Month" 
    },
    { 
        icon: <Zap className="w-10 h-10 text-primary" />,
        value: 48,
        prefix: "-",
        suffix: "%",
        label: "Cycle Time" 
    },
    { 
        icon: <ShieldCheck className="w-10 h-10 text-primary" />,
        value: 90,
        prefix: "-",
        suffix: "%",
        label: "Error Rate"
    },
    { 
        icon: <CheckCircle className="w-10 h-10 text-primary" />,
        value: 85,
        prefix: "+",
        suffix: "%",
        label: "First-Pass Approvals" 
    },
]

export function RoiSection() {
  return (
    <SectionWrapper id="roi">
       <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">ROI Snapshot</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Measurable impact on your project's efficiency and bottom line.
            </p>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <Card key={index} className="flex flex-col items-center justify-center p-8 text-center bg-card border-white/10 shadow-e1 rounded-lg">
            <div className="mb-4">{stat.icon}</div>
            <p className="font-headline text-5xl font-bold text-foreground glowing-text">
                {stat.prefix}
                <AnimatedCounter from={0} to={stat.value} />
                {stat.suffix}
            </p>
            <p className="mt-2 text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
