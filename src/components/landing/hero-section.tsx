import { Button } from "@/components/ui/button";
import { PlayCircle, Star, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="flex justify-center items-center gap-2">
             <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Youtube className="h-5 w-5 text-red-600" /> Over 800k YouTube Views</p>
          </div>
          <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl" style={{lineHeight: 1.2}}>
              Scale smart and cut costs with AI workers
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
             AI Voice, Chat & Automation Agents built for your business - boosting revenue and saving time 24/7.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <Link href="#">
                  Book a call with Brendan
                </Link>
              </Button>
            </div>
          </div>

           <div className="mt-16 sm:mt-24">
            <div className="mx-auto max-w-5xl">
              <div className="flow-root">
                <div className="relative -m-2 rounded-xl border-2 border-primary/20 bg-gray-900/5 p-2 ring-1 ring-inset ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                   <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary/80 text-primary-foreground font-bold">LIVE DEMO WITH THE AI AGENT</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="h-20 w-20 bg-primary/50 hover:bg-primary/70 rounded-full">
                        <PlayCircle className="h-16 w-16 text-primary-foreground" />
                      </Button>
                  </div>
                  <Image
                    src="https://picsum.photos/seed/robot/600/400"
                    alt="AI Agent"
                    data-ai-hint="robot future"
                    width={600}
                    height={400}
                    className="rounded-md shadow-2xl ring-1 ring-white/10 opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
