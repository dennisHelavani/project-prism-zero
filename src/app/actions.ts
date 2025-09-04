
'use server';

import { generateHseCdmDocuments, type GenerateHseCdmDocumentsInput, type GenerateHseCdmDocumentsOutput } from "@/ai/flows/generate-hse-cdm-documents";
import { z } from "zod";

const FormSchema = z.object({
  siteDescription: z.string().min(20, { message: "Please provide a more detailed site description (min. 20 characters)." }),
  projectScope: z.string().min(20, { message: "Please provide a more detailed project scope (min. 20 characters)." }),
  keyRisks: z.string().min(10, { message: "Please identify at least one key risk." }),
  mitigationMeasures: z.string().min(10, { message: "Please describe at least one mitigation measure." }),
  regulatoryRequirements: z.string().min(10, { message: "Please list relevant regulatory requirements." }),
});

export type FormState = {
  message: string;
  errors?: {
    [key in keyof GenerateHseCdmDocumentsInput]?: string[];
  };
  data?: GenerateHseCdmDocumentsOutput;
};

export async function generateDocumentsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    siteDescription: formData.get("siteDescription"),
    projectScope: formData.get("projectScope"),
    keyRisks: formData.get("keyRisks"),
    mitigationMeasures: formData.get("mitigationMeasures"),
    regulatoryRequirements: formData.get("regulatoryRequirements"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateHseCdmDocuments(validatedFields.data);
    if (!result.ramsDocument || !result.cdmDocument) {
      throw new Error("AI failed to generate one or more documents.");
    }
    return { message: "Documents generated successfully.", data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `An error occurred during document generation: ${errorMessage}` };
  }
}
