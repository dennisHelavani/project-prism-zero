import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SectionWrapper } from "./section-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const reviews = [
  {
    quote: "The fastest way to produce RAMS. This tool has genuinely saved our team countless hours of tedious work. The outputs are clean, professional, and easy to edit.",
    author: "Alex Thompson",
    title: "Project Lead, Tier 1 Construction",
    avatar: "AT",
  },
  {
    quote: "Clean, simple, and surprisingly accurate. I was skeptical about an AI generating these docs, but the quality is impressive. It's a game-changer for our ops.",
    author: "Samantha Carter",
    title: "Operations Manager",
    avatar: "SC",
  },
  {
    quote: "As a site manager, paperwork is my least favorite part of the job. Hard Hat AI has streamlined our entire process. Documentation in minutes is no exaggeration.",
    author: "Ben Williams",
    title: "Site Manager",
    avatar: "BW",
  },
  {
    quote: "A must-have for any serious construction firm in the UK. The time and cost savings on compliance are massive.",
    author: "Richard Davis",
    title: "Director, Regional Building Co.",
    avatar: "RD",
  }
];

export function ReviewsSection() {
  return (
    <SectionWrapper className="py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-headline text-4xl font-bold text-foreground">Loved by industry professionals</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Don't just take our word for it. Here's what managers and leads are saying.
        </p>
      </div>
      <Carousel className="w-full mt-16"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {reviews.map((review, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="h-full bg-card border-white/10 flex flex-col">
                  <CardContent className="flex flex-col items-start justify-between flex-grow gap-6 p-6">
                    <p className="text-foreground">"{review.quote}"</p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                         <AvatarImage src={`https://i.pravatar.cc/40?u=${review.author}`} />
                        <AvatarFallback>{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{review.author}</p>
                        <p className="text-sm text-muted-foreground">{review.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </SectionWrapper>
  );
}
