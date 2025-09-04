'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateDocumentsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CtaButton } from '../ui/cta-button';
import { Command, Loader2 } from 'lucide-react';
import type { GenerateHseCdmDocumentsOutput } from '@/ai/flows/generate-hse-cdm-documents';

const FormSchema = z.object({
  siteDescription: z.string().min(20, { message: "Please provide a more detailed site description (min. 20 characters)." }),
  projectScope: z.string().min(20, { message: "Please provide a more detailed project scope (min. 20 characters)." }),
  keyRisks: z.string().min(10, { message: "Please identify at least one key risk." }),
  mitigationMeasures: z.string().min(10, { message: "Please describe at least one mitigation measure." }),
  regulatoryRequirements: z.string().min(10, { message: "Please list relevant regulatory requirements." }),
});

type FormValues = z.infer<typeof FormSchema>;

interface DocumentFormProps {
  onSuccess: (data: GenerateHseCdmDocumentsOutput) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <CtaButton type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Command />
          Get my documents
        </>
      )}
    </CtaButton>
  );
}

export function DocumentForm({ onSuccess }: DocumentFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(generateDocumentsAction, { message: '' });

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      siteDescription: '',
      projectScope: '',
      keyRisks: '',
      mitigationMeasures: '',
      regulatoryRequirements: '',
    },
    // To display server-side errors
    errors: state.errors ? Object.fromEntries(Object.entries(state.errors).map(([key, value]) => [key, { type: 'server', message: value?.[0] }])) : {},
  });
  
  useEffect(() => {
    if (state.message) {
      if (state.data) {
        toast({
          title: "Success!",
          description: state.message,
        });
        onSuccess(state.data);
      } else {
         toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
        // Update form errors from server validation
        if (state.errors) {
            Object.entries(state.errors).forEach(([key, value]) => {
                if (value) {
                    form.setError(key as keyof FormValues, { type: 'server', message: value[0] });
                }
            });
        }
      }
    }
  }, [state, toast, onSuccess, form]);
  
  return (
    <Form {...form}>
      <form action={formAction} className="mt-8 space-y-6 text-left">
        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., A multi-story residential building construction in a dense urban area..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectScope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Scope</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Demolition of existing structure, excavation, and construction of a 5-story building with basement parking..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="keyRisks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Risks</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Working at height, asbestos, public interface" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="mitigationMeasures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mitigation Measures</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Full scaffolding with netting, licensed asbestos removal, defined pedestrian routes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="regulatoryRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regulatory Requirements</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CDM 2015, Health and Safety at Work Act 1974" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-center pt-4">
          <SubmitButton />
          <p className="mt-4 text-xs text-muted-foreground">
            By generating, you agree to our Terms. AI-generated — review before use.
          </p>
        </div>
      </form>
    </Form>
  );
}
