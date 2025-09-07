"use client";

import React from "react";
import { SectionWrapper } from "./section-wrapper";
import { AnimatedTestimonials } from "../ui/animated-testimonials";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";

const reviews = [
  {
    quote: "The fastest way to produce RAMS. Clean, professional, easy to edit.",
    name: "Alex Thompson",
    title: "Project Lead, Tier 1 Construction",
    image: "https://picsum.photos/101/101",
    rating: 5,
  },
  {
    quote: "Simple and accurate. It’s a game-changer for our operations.",
    name: "Samantha Carter",
    title: "Operations Manager, High-Rise Project",
    image: "https://picsum.photos/102/102",
    rating: 5,
  },
  {
    quote: "Documentation in minutes is no exaggeration.",
    name: "Ben Williams",
    title: "Site Manager, Civil Engineering",
    image: "https://picsum.photos/103/103",
    rating: 5,
  },
  {
    quote: "The time and cost savings on compliance are significant.",
    name: "Richard Davis",
    title: "Director, Regional Building Co.",
    image: "https://picsum.photos/104/104",
    rating: 5,
  },
   {
    quote: "The generated documents are top-notch—indispensable for safety planning.",
    name: "Emily White",
    title: "HSE Manager",
    image: "https://picsum.photos/100/100",
    rating: 5,
  }
];

export function ReviewsSection() {
  return (
    <SectionWrapper id="reviews" className="py-16 md:py-24 scroll-m-24">
      <MotionDiv>
        <div className="mx-auto max-w-2xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="Loved by industry professionals"
          />
        </div>
      </MotionDiv>
      <MotionDiv delay={0.2}>
        <div className="mt-12 md:mt-16 flex justify-center">
           <AnimatedTestimonials
            items={reviews}
            direction="right"
            speed="slow"
          />
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
