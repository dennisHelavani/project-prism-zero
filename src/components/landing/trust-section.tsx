import { SectionWrapper } from "./section-wrapper";
import { Star } from "lucide-react";

const fallbackReviews = [
  {
    quote: "Saved us hours of paperwork every single week. A must-have for any site manager.",
    author: "David L., Site Manager"
  },
  {
    quote: "The documentation generation is a complete game changer. What used to take half a day now takes minutes.",
    author: "Jennifer S., HSE Lead"
  }
];

export function TrustSection() {
  return (
    <div className="bg-card">
        <SectionWrapper className="py-16">
            <div className="grid grid-cols-1 items-center gap-y-12 md:grid-cols-3 md:gap-x-12">
                <div className="text-center md:text-left">
                    <h2 className="font-headline text-2xl font-semibold text-foreground">Trusted by professionals</h2>
                    <div className="mt-2 flex justify-center md:justify-start items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <p className="mt-2 text-muted-foreground">Excellent 4.9 out of 5 stars on Trustpilot</p>
                </div>
                <div className="col-span-2 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {fallbackReviews.map((review, index) => (
                        <figure key={index}>
                            <blockquote className="text-lg font-medium text-foreground">
                                <p>“{review.quote}”</p>
                            </blockquote>
                            <figcaption className="mt-4 text-sm text-muted-foreground">
                                — {review.author}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    </div>
  );
}
