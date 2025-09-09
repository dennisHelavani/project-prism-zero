
'use client';

import { SectionWrapper } from '@/components/landing/section-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin } from 'lucide-react';
import BlurText from '@/components/ui/blur-text';
import { MotionDiv } from '@/components/ui/motion-div';
import { cn } from '@/lib/utils';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export function ContactSection() {
  const { register, handleSubmit } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // Handle form submission
  };

  const inputStyles = "border-[#FABE2C]/50 focus:border-[#FABE2C] focus:ring-[#FABE2C]";

  return (
    <SectionWrapper id="contact" className="!py-24 md:!py-32 mt-12 scroll-m-24">
        <MotionDiv>
          <div className="mx-auto max-w-5xl text-center">
            <BlurText
                as="h2"
                className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
                text="Get in Touch"
            />
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Have questions or want to book a demo? Reach out to us.
            </p>
            <div className="mt-16 grid grid-cols-1 gap-y-12 gap-x-8 md:grid-cols-2">
              <div className="flex flex-col items-start text-left space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <p className="mt-1 text-gray-400">
                      General Inquiries: <a href="mailto:hello@hardhat.ai" className="hover:text-primary">hello@hardhat.ai</a>
                    </p>
                     <p className="mt-1 text-gray-400">
                      Support: <a href="mailto:support@hardhat.ai" className="hover:text-primary">support@hardhat.ai</a>
                    </p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Phone</h3>
                    <p className="mt-1 text-gray-400">
                      +44 (0) 20 1234 5678
                    </p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Office</h3>
                    <p className="mt-1 text-gray-400">
                      123 Innovation Drive, London, UK
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <Input {...register('name')} id="name" placeholder="Name" required className={inputStyles} />
                </div>
                <div>
                   <label htmlFor="email" className="sr-only">Email</label>
                  <Input {...register('email')} id="email" type="email" placeholder="Email" required className={inputStyles}/>
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <Textarea {...register('message')} id="message" placeholder="Message" rows={5} required className={inputStyles}/>
                </div>
                <Button type="submit" className="w-full bg-primary/80 hover:bg-primary">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
          </MotionDiv>
    </SectionWrapper>
  );
}
