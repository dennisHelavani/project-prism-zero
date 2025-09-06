"use client";

import React from "react";
import { SectionWrapper } from "./section-wrapper";
import { AnimatedTestimonials } from "../ui/animated-testimonials";

const reviews = [
  {
    quote: "The fastest way to produce RAMS. This tool has genuinely saved our team countless hours. The outputs are clean, professional, and easy to edit. RAMS time cut by 80%.",
    name: "Alex Thompson",
    title: "Project Lead, Tier 1 Construction",
    image: "https://picsum.photos/101/101",
    rating: 5,
  },
  {
    quote: "Clean, simple, and surprisingly accurate. I was skeptical about an AI generating these docs, but the quality is impressive. It's a game-changer for our ops.",
    name: "Samantha Carter",
    title: "Operations Manager, High-Rise Project",
    image: "https://picsum.photos/102/102",
    rating: 5,
  },
  {
    quote: "As a site manager, paperwork is my least favorite part of the job. Hard Hat AI has streamlined our entire process. Documentation in minutes is no exaggeration.",
    name: "Ben Williams",
    title: "Site Manager, Civil Engineering",
    image: "https://picsum.photos/103/103",
    rating: 5,
  },
  {
    quote: "A must-have for any serious construction firm in the UK. The time and cost savings on compliance are massive. We saw a 40% reduction in rework.",
    name: "Richard Davis",
    title: "Director, Regional Building Co.",
    image: "https://picsum.photos/104/104",
    rating: 5,
  },
   {
    quote: "The interface is intuitive and the generated documents are top-notch. It has become an indispensable tool for our site safety planning.",
    name: "Emily White",
    title: "HSE Manager",
    image: "https://picsum.photos/100/100",
    rating: 5,
  }
];

export function ReviewsSection() {
  return (
    <SectionWrapper id="reviews" className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text">Loved by industry professionals</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Don't just take our word for it. Here's what managers and leads are saying.
        </p>
      </div>
      <div className="mt-12 md:mt-16 flex justify-center">
         <AnimatedTestimonials
          items={reviews}
          direction="right"
          speed="slow"
        />
      </div>
    </SectionWrapper>
  );
}
