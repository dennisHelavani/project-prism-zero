'use server';
/**
 * @fileOverview A flow to generate HSE & CDM documents based on site-specific information.
 *
 * - generateHseCdmDocuments - A function that handles the document generation process.
 * - GenerateHseCdmDocumentsInput - The input type for the generateHseCdmDocuments function.
 * - GenerateHseCdmDocumentsOutput - The return type for the generateHseCdmDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHseCdmDocumentsInputSchema = z.object({
  siteDescription: z.string().describe('A detailed description of the construction site.'),
  projectScope: z.string().describe('The scope of the construction project.'),
  keyRisks: z.string().describe('Identification of key risks associated with the project.'),
  mitigationMeasures: z.string().describe('Planned mitigation measures for identified risks.'),
  regulatoryRequirements: z.string().describe('Relevant regulatory requirements for the project.'),
});

export type GenerateHseCdmDocumentsInput = z.infer<typeof GenerateHseCdmDocumentsInputSchema>;

const GenerateHseCdmDocumentsOutputSchema = z.object({
  ramsDocument: z.string().describe('A generated Risk Assessment and Method Statement document.'),
  cdmDocument: z.string().describe('A generated Construction Design and Management document.'),
});

export type GenerateHseCdmDocumentsOutput = z.infer<typeof GenerateHseCdmDocumentsOutputSchema>;

export async function generateHseCdmDocuments(input: GenerateHseCdmDocumentsInput): Promise<GenerateHseCdmDocumentsOutput> {
  return generateHseCdmDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHseCdmDocumentsPrompt',
  input: {schema: GenerateHseCdmDocumentsInputSchema},
  output: {schema: GenerateHseCdmDocumentsOutputSchema},
  prompt: `You are an expert in Health, Safety, and Environment (HSE) and Construction Design and Management (CDM).
  Your task is to generate compliant and editable HSE & CDM documents based on the provided site-specific information.

  Here is the information about the construction site and project:

  Site Description: {{{siteDescription}}}
  Project Scope: {{{projectScope}}}
  Key Risks: {{{keyRisks}}}
  Mitigation Measures: {{{mitigationMeasures}}}
  Regulatory Requirements: {{{regulatoryRequirements}}}

  Based on this information, generate a Risk Assessment and Method Statement (RAMS) document and a Construction Design and Management (CDM) document.
  Ensure the documents are comprehensive, compliant with relevant regulations, and easily editable.

  RAMS Document:
  CDM Document:`,
});

const generateHseCdmDocumentsFlow = ai.defineFlow(
  {
    name: 'generateHseCdmDocumentsFlow',
    inputSchema: GenerateHseCdmDocumentsInputSchema,
    outputSchema: GenerateHseCdmDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
