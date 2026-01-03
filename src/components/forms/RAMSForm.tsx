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
} from './FormFieldsShared';
import { Checkbox } from '@/components/ui/checkbox';

// Permit options with Other
const PERMITS = [
    { id: 'break-ground', label: 'Permit to Break Ground / Dig' },
    { id: 'hot-works', label: 'Hot Works Permit' },
    { id: 'lift', label: 'Permit to Lift' },
    { id: 'work-at-height', label: 'Work at Height Permit' },
    { id: 'other', label: 'Other' },
] as const;

type PermitId = (typeof PERMITS)[number]['id'];

type RAMSFormData = {
    // Project Details
    email: string;
    projectName: string; // Job description / RAMS title
    dateStart: string;
    duration: string;
    location: string;
    deliveriesNote: string;

    // Technical Info
    technicalInfo: string;

    // Permits
    permits: PermitId[];
    permitsOtherText: string;

    // AI Input
    aiTaskDescription: string;

    // Files
    companyLogo: File | null;
    deliveriesImage: File | null;
};

const initialFormData: RAMSFormData = {
    email: '',
    projectName: '',
    dateStart: '',
    duration: '',
    location: '',
    deliveriesNote: '',
    technicalInfo: '',
    permits: [],
    permitsOtherText: '',
    aiTaskDescription: '',
    companyLogo: null,
    deliveriesImage: null,
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
    const [isLoadingDefaults, setIsLoadingDefaults] = React.useState(false);

    // Load profile defaults on mount
    React.useEffect(() => {
        if (!email) return;

        const loadDefaults = async () => {
            setIsLoadingDefaults(true);
            try {
                const res = await fetch(`/api/profile/defaults?email=${encodeURIComponent(email)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaults) {
                        setFormData((prev) => ({
                            ...prev,
                            permits: data.defaults.permits || prev.permits,
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to load defaults:', err);
            } finally {
                setIsLoadingDefaults(false);
            }
        };

        loadDefaults();
    }, [email]);

    const updateField = <K extends keyof RAMSFormData>(key: K, value: RAMSFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const togglePermit = (permitId: PermitId) => {
        setFormData((prev) => {
            const current = prev.permits;
            if (current.includes(permitId)) {
                return { ...prev, permits: current.filter((p) => p !== permitId) };
            } else {
                return { ...prev, permits: [...current, permitId] };
            }
        });
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof RAMSFormData, string>> = {};

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Job description is required';
        }
        if (!formData.dateStart) {
            newErrors.dateStart = 'Start date is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.aiTaskDescription.trim()) {
            newErrors.aiTaskDescription = 'Brief description is required for AI generation';
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
                } else if (value !== null && value !== undefined) {
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

            // Save profile defaults
            if (email) {
                await fetch('/api/profile/defaults', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        defaults: {
                            permits: formData.permits,
                        },
                    }),
                }).catch((err) => console.error('Failed to save defaults:', err));
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
                        Your RAMS is on the way!<br />
                        You'll receive it via email shortly.
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
                        Fill in the project details below. AI will generate your Risk Assessment & Method Statement.
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
                    <FormInput
                        label="Job Description / RAMS Title"
                        placeholder="e.g., RAMS 01 – Finsbury Bower - Beam Installation"
                        value={formData.projectName}
                        onChange={(e) => updateField('projectName', e.target.value)}
                        required
                        error={errors.projectName}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormInput
                            label="Anticipated Commencement Date"
                            type="date"
                            value={formData.dateStart}
                            onChange={(e) => updateField('dateStart', e.target.value)}
                            required
                            error={errors.dateStart}
                        />
                        <FormInput
                            label="Duration of Works"
                            placeholder="e.g., 3 weeks"
                            value={formData.duration}
                            onChange={(e) => updateField('duration', e.target.value)}
                        />
                    </div>

                    <FormInput
                        label="Location of Works"
                        placeholder="Site address or area"
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        required
                        error={errors.location}
                        className="mt-4"
                    />
                </FormSection>

                {/* Deliveries */}
                <FormSection title="Deliveries">
                    <FormTextarea
                        label="Deliveries Text"
                        placeholder="Describe deliveries and logistics, or 'As per Client CPP and Induction'"
                        value={formData.deliveriesNote}
                        onChange={(e) => updateField('deliveriesNote', e.target.value)}
                    />
                    <FileUploadField
                        label="Deliveries Image (Optional)"
                        description="Upload a traffic management plan or site layout"
                        accept="image/*"
                        value={formData.deliveriesImage}
                        onChange={(file) => updateField('deliveriesImage', file)}
                        optional
                    />
                </FormSection>

                {/* Technical Information */}
                <FormSection title="Technical Information and Reports">
                    <FormTextarea
                        label="Technical Information"
                        placeholder="Include any relevant technical reports, specifications, standards, or reference documents..."
                        value={formData.technicalInfo}
                        onChange={(e) => updateField('technicalInfo', e.target.value)}
                        className="min-h-[100px]"
                    />
                </FormSection>

                {/* Permits */}
                <FormSection title="Permits Required">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PERMITS.map((permit) => (
                            <label
                                key={permit.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[.02] hover:bg-white/[.05] cursor-pointer transition-colors"
                            >
                                <Checkbox
                                    checked={formData.permits.includes(permit.id)}
                                    onCheckedChange={() => togglePermit(permit.id)}
                                />
                                <span className="text-sm text-white/90">{permit.label}</span>
                            </label>
                        ))}
                    </div>
                    {formData.permits.includes('other') && (
                        <FormInput
                            label="Specify Other Permits"
                            placeholder="Describe other permits required..."
                            value={formData.permitsOtherText}
                            onChange={(e) => updateField('permitsOtherText', e.target.value)}
                            className="mt-4"
                        />
                    )}
                </FormSection>

                {/* AI Input */}
                <FormSection
                    title="Brief Description for AI"
                    description="Describe the works, constraints, and key hazards. The more detail, the better the output."
                >
                    <FormTextarea
                        label="AI Input"
                        placeholder="e.g., Write me a risk assessment and method statement for beam installation involving temporary jacks using a crawler crane. Key hazards include working at height, crane operations near live traffic..."
                        value={formData.aiTaskDescription}
                        onChange={(e) => updateField('aiTaskDescription', e.target.value)}
                        required
                        error={errors.aiTaskDescription}
                        className="min-h-[140px]"
                    />
                </FormSection>

                {/* Company Logo */}
                <FormSection title="Branding (Optional)">
                    <FileUploadField
                        label="Company Logo"
                        accept="image/*"
                        value={formData.companyLogo}
                        onChange={(file) => updateField('companyLogo', file)}
                        optional
                    />
                </FormSection>

                {/* Pre-submit warning */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-200">
                        You can't return once you submit. Please double check your answers before proceeding.
                    </p>
                </div>

                {/* Warning Modal */}
                {showWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
                            <div className="flex items-center gap-3 text-amber-400">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="font-semibold">Confirm Submission</h3>
                            </div>
                            <p className="text-white/70 text-sm">
                                You can't return once you submit. Are you sure all details are correct?
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
                        disabled={isSubmitting || isLoadingDefaults}
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
