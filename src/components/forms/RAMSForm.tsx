'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import {
    FormSection,
    FormCard,
    FormInput,
    FormTextarea,
    FileUploadField,
    PermitsCheckboxGroup,
    type PermitId,
} from './FormFieldsShared';

type RAMSFormData = {
    // Project Details
    email: string;
    projectName: string;
    dateStart: string;
    duration: string;
    location: string;
    aiTaskDescription: string;
    deliveriesNote: string;

    // Permits
    permits: PermitId[];

    // Contacts
    clientName: string;
    managerName: string;
    supervisorName: string;
    emergencyArrangements: string;
    occupationalHealth: string;

    // Files
    companyLogo: File | null;
    clientLogo: File | null;
    trafficManagementPlan: File | null;
};

const initialFormData: RAMSFormData = {
    email: '',
    projectName: '',
    dateStart: '',
    duration: '',
    location: '',
    aiTaskDescription: '',
    deliveriesNote: '',
    permits: [],
    clientName: '',
    managerName: '',
    supervisorName: '',
    emergencyArrangements: '',
    occupationalHealth: '',
    companyLogo: null,
    clientLogo: null,
    trafficManagementPlan: null,
};

type Props = {
    email: string | null;
    code: string | null;
    expiresAt?: string;
};

export default function RAMSForm({ email, code, expiresAt }: Props) {
    const [formData, setFormData] = React.useState<RAMSFormData>({
        ...initialFormData,
        email: email ?? '',
    });
    const [errors, setErrors] = React.useState<Partial<Record<keyof RAMSFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showWarning, setShowWarning] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);

    const updateField = <K extends keyof RAMSFormData>(key: K, value: RAMSFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof RAMSFormData, string>> = {};

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }
        if (!formData.dateStart) {
            newErrors.dateStart = 'Start date is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.aiTaskDescription.trim()) {
            newErrors.aiTaskDescription = 'Task description is required for AI generation';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreSubmit = () => {
        if (validate()) {
            setShowWarning(true);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setShowWarning(false);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('product', 'RAMS');
            formDataToSend.append('code', code ?? '');

            // Append all text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (Array.isArray(value)) {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (value !== null) {
                    formDataToSend.append(key, String(value));
                }
            });

            const res = await fetch('/api/forms/submit', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!res.ok) {
                throw new Error('Submission failed');
            }

            setSubmitSuccess(true);
        } catch (err) {
            console.error('Form submission error:', err);
            setErrors({ projectName: 'Failed to submit form. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <FormCard>
                <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                        <Send className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Done!</h2>
                    <p className="text-white/70">
                        Your RAMS are on their way!<br />
                        You'll receive them via email shortly.
                    </p>
                </div>
            </FormCard>
        );
    }

    return (
        <FormCard>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white">RAMS Generator</h2>
                    <p className="text-sm text-white/60">
                        Fill in the project details below. An AI will generate your Risk Assessment & Method Statement.
                    </p>
                </div>

                {/* Email (readonly) */}
                <FormInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="opacity-60"
                />

                {/* Project Details Section */}
                <FormSection title="Project / Activity Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project / Activity Name"
                            placeholder="e.g., RAMS 01 – Finsbury Bower - Beam Installation"
                            value={formData.projectName}
                            onChange={(e) => updateField('projectName', e.target.value)}
                            required
                            error={errors.projectName}
                        />
                        <FormInput
                            label="Planned Start Date"
                            type="date"
                            value={formData.dateStart}
                            onChange={(e) => updateField('dateStart', e.target.value)}
                            required
                            error={errors.dateStart}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Duration of Works"
                            placeholder="e.g., 3 weeks"
                            value={formData.duration}
                            onChange={(e) => updateField('duration', e.target.value)}
                        />
                        <FormInput
                            label="Location of Work"
                            placeholder="Site address or area"
                            value={formData.location}
                            onChange={(e) => updateField('location', e.target.value)}
                            required
                            error={errors.location}
                        />
                    </div>
                </FormSection>

                {/* AI Task Description */}
                <FormSection
                    title="Task Description for AI"
                    description="Describe the task including specific tools and equipment. The more detail, the better the output."
                >
                    <FormTextarea
                        label="Task Description"
                        placeholder="e.g., Write me a risk assessment and method statement for Beam installation involving temporary jacks using a crawler crane..."
                        value={formData.aiTaskDescription}
                        onChange={(e) => updateField('aiTaskDescription', e.target.value)}
                        required
                        error={errors.aiTaskDescription}
                        className="min-h-[140px]"
                    />
                </FormSection>

                {/* Deliveries / TMP */}
                <FormSection title="Traffic Management">
                    <FileUploadField
                        label="Traffic Management Plan"
                        description="Upload an image of the TMP, or leave empty to use 'as per Client CPP and Induction'"
                        accept="image/*"
                        value={formData.trafficManagementPlan}
                        onChange={(file) => updateField('trafficManagementPlan', file)}
                        optional
                    />
                    <FormInput
                        label="Or describe deliveries"
                        placeholder="As per Client CPP and Induction"
                        value={formData.deliveriesNote}
                        onChange={(e) => updateField('deliveriesNote', e.target.value)}
                    />
                </FormSection>

                {/* Permits */}
                <PermitsCheckboxGroup
                    value={formData.permits}
                    onChange={(v) => updateField('permits', v)}
                />

                {/* Contacts */}
                <FormSection title="Client & Emergency Contacts">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Client Name"
                            placeholder="Client company or person"
                            value={formData.clientName}
                            onChange={(e) => updateField('clientName', e.target.value)}
                        />
                        <FormInput
                            label="Manager"
                            placeholder="Name"
                            value={formData.managerName}
                            onChange={(e) => updateField('managerName', e.target.value)}
                        />
                    </div>
                    <FormInput
                        label="Supervisor"
                        placeholder="Name"
                        value={formData.supervisorName}
                        onChange={(e) => updateField('supervisorName', e.target.value)}
                    />
                    <FormTextarea
                        label="Emergency Arrangements"
                        placeholder="Include specific if known, or 'as per Client CPP and Induction'"
                        value={formData.emergencyArrangements}
                        onChange={(e) => updateField('emergencyArrangements', e.target.value)}
                    />
                    <FormTextarea
                        label="Occupational Health Notes"
                        placeholder="Include specific if known, or 'as per Client CPP and Induction'"
                        value={formData.occupationalHealth}
                        onChange={(e) => updateField('occupationalHealth', e.target.value)}
                    />
                </FormSection>

                {/* Logos */}
                <FormSection title="Branding (Optional)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                            label="Company Logo"
                            accept="image/*"
                            value={formData.companyLogo}
                            onChange={(file) => updateField('companyLogo', file)}
                            optional
                        />
                        <FileUploadField
                            label="Client Logo"
                            accept="image/*"
                            value={formData.clientLogo}
                            onChange={(file) => updateField('clientLogo', file)}
                            optional
                        />
                    </div>
                </FormSection>

                {/* Warning Modal */}
                {showWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
                            <div className="flex items-center gap-3 text-amber-400">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="font-semibold">Confirm Submission</h3>
                            </div>
                            <p className="text-white/70 text-sm">
                                You can't return once you select submit. Please double check your answers before proceeding.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowWarning(false)}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        type="button"
                        onClick={handlePreSubmit}
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Generate RAMS
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormCard>
    );
}
