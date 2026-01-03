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

// Permit options
const PERMITS = [
    { id: 'break-ground', label: 'Permit to Break Ground / Dig' },
    { id: 'hot-works', label: 'Hot Works Permit' },
    { id: 'lift', label: 'Permit to Lift' },
    { id: 'work-at-height', label: 'Work at Height Permit' },
    { id: 'other', label: 'Other' },
] as const;

type PermitId = (typeof PERMITS)[number]['id'];

// Form data keys match template placeholder names exactly
type RAMSFormData = {
    // Customer
    email: string;

    // Project Basics
    RAMS_TITLE: string;
    RAMS_START_DATE: string;
    RAMS_DURATION: string;

    // Company Details
    RAMS_COMPANY_NAME: string;
    RAMS_COMPANY_PHONE: string;
    RAMS_COMPANY_EMAIL: string;

    // Site/Location Details
    RAMS_SITE_ADDRESS_LINE1: string;
    RAMS_SITE_ADDRESS_LINE2: string;
    RAMS_SITE_CITY: string;
    RAMS_SITE_POSTCODE: string;
    RAMS_SITE_COUNTRY: string;

    // Deliveries
    RAMS_DELIVERIES_TEXT: string;

    // Emergency Contacts
    RAMS_FIRST_AIDERS: string;
    RAMS_FIRE_MARSHALLS: string;

    // Permits
    permits: PermitId[];
    permitsOtherText: string;

    // AI Input (for generation)
    aiTaskDescription: string;

    // Files (optional)
    RAMS_COMPANY_LOGO_IMG: File | null;
    RAMS_DELIVERIES_IMG: File | null;
};

const initialFormData: RAMSFormData = {
    email: '',
    RAMS_TITLE: '',
    RAMS_START_DATE: '',
    RAMS_DURATION: '',
    RAMS_COMPANY_NAME: '',
    RAMS_COMPANY_PHONE: '',
    RAMS_COMPANY_EMAIL: '',
    RAMS_SITE_ADDRESS_LINE1: '',
    RAMS_SITE_ADDRESS_LINE2: '',
    RAMS_SITE_CITY: '',
    RAMS_SITE_POSTCODE: '',
    RAMS_SITE_COUNTRY: '',
    RAMS_DELIVERIES_TEXT: '',
    RAMS_FIRST_AIDERS: '',
    RAMS_FIRE_MARSHALLS: '',
    permits: [],
    permitsOtherText: '',
    aiTaskDescription: '',
    RAMS_COMPANY_LOGO_IMG: null,
    RAMS_DELIVERIES_IMG: null,
};

type Props = {
    email: string | null;
    code: string | null;
    expiresAt?: string;
};

export default function RAMSForm({ email, code }: Props) {
    const [formData, setFormData] = React.useState<RAMSFormData>({
        ...initialFormData,
        email: email ?? '',
    });
    const [errors, setErrors] = React.useState<Partial<Record<keyof RAMSFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showWarning, setShowWarning] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [isLoadingDefaults, setIsLoadingDefaults] = React.useState(false);

    // Load RAMS-specific profile defaults on mount
    React.useEffect(() => {
        if (!email) return;

        const loadDefaults = async () => {
            setIsLoadingDefaults(true);
            try {
                const res = await fetch(`/api/profile/defaults?email=${encodeURIComponent(email)}&product=RAMS`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaults) {
                        setFormData((prev) => ({
                            ...prev,
                            RAMS_COMPANY_NAME: data.defaults.RAMS_COMPANY_NAME || prev.RAMS_COMPANY_NAME,
                            RAMS_COMPANY_PHONE: data.defaults.RAMS_COMPANY_PHONE || prev.RAMS_COMPANY_PHONE,
                            RAMS_COMPANY_EMAIL: data.defaults.RAMS_COMPANY_EMAIL || prev.RAMS_COMPANY_EMAIL,
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

    // Build permits list string for template
    const buildPermitsList = (): string => {
        const selected: string[] = formData.permits
            .filter((id) => id !== 'other')
            .map((id) => PERMITS.find((p) => p.id === id)?.label || id);

        if (formData.permits.includes('other') && formData.permitsOtherText.trim()) {
            selected.push(formData.permitsOtherText.trim());
        }

        return selected.join(', ');
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof RAMSFormData, string>> = {};

        if (!formData.RAMS_TITLE.trim()) {
            newErrors.RAMS_TITLE = 'RAMS title is required';
        }
        if (!formData.RAMS_START_DATE) {
            newErrors.RAMS_START_DATE = 'Start date is required';
        }
        if (!formData.RAMS_DURATION.trim()) {
            newErrors.RAMS_DURATION = 'Duration is required';
        }
        if (!formData.RAMS_SITE_ADDRESS_LINE1.trim()) {
            newErrors.RAMS_SITE_ADDRESS_LINE1 = 'Site address is required';
        }
        if (!formData.RAMS_SITE_CITY.trim()) {
            newErrors.RAMS_SITE_CITY = 'City is required';
        }
        if (!formData.aiTaskDescription.trim()) {
            newErrors.aiTaskDescription = 'Works description is required for AI generation';
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
            // Build placeholders object with exact keys
            const placeholders: Record<string, string> = {
                RAMS_TITLE: formData.RAMS_TITLE,
                RAMS_COMPANY_NAME: formData.RAMS_COMPANY_NAME,
                RAMS_SITE_ADDRESS_LINE1: formData.RAMS_SITE_ADDRESS_LINE1,
                RAMS_SITE_ADDRESS_LINE2: formData.RAMS_SITE_ADDRESS_LINE2,
                RAMS_SITE_CITY: formData.RAMS_SITE_CITY,
                RAMS_SITE_POSTCODE: formData.RAMS_SITE_POSTCODE,
                RAMS_SITE_COUNTRY: formData.RAMS_SITE_COUNTRY,
                RAMS_COMPANY_PHONE: formData.RAMS_COMPANY_PHONE,
                RAMS_COMPANY_EMAIL: formData.RAMS_COMPANY_EMAIL,
                RAMS_START_DATE: formData.RAMS_START_DATE,
                RAMS_DURATION: formData.RAMS_DURATION,

                // Granular Permits
                RAMS_PERMIT_BREAK_GROUND: formData.permits.includes('break-ground') ? 'Permit to Break Ground / Dig' : '',
                RAMS_PERMIT_TO_WORK: formData.permits.includes('hot-works') ? 'Hot Works Permit' : '',
                RAMS_PERMIT_TO_LIFT: formData.permits.includes('lift') ? 'Permit to Lift' : '',
                RAMS_PERMIT_WORK_AT_HEIGHT: formData.permits.includes('work-at-height') ? 'Work at Height Permit' : '',

                // Only 'Other' text goes into the generic list
                RAMS_PERMITS_LIST: formData.permits.includes('other') ? formData.permitsOtherText.trim() : '',

                RAMS_FIRST_AIDERS: formData.RAMS_FIRST_AIDERS,
                RAMS_FIRE_MARSHALLS: formData.RAMS_FIRE_MARSHALLS,
                RAMS_DELIVERIES_TEXT: formData.RAMS_DELIVERIES_TEXT,
            };

            // AI input stored separately
            const aiInput: Record<string, string> = {
                aiTaskDescription: formData.aiTaskDescription,
            };

            const formDataToSend = new FormData();
            formDataToSend.append('product', 'RAMS');
            formDataToSend.append('code', code ?? '');
            formDataToSend.append('email', email ?? '');
            formDataToSend.append('placeholders', JSON.stringify(placeholders));
            formDataToSend.append('ai_input', JSON.stringify(aiInput));

            // Add optional uploads
            if (formData.RAMS_COMPANY_LOGO_IMG) {
                formDataToSend.append('RAMS_COMPANY_LOGO_IMG', formData.RAMS_COMPANY_LOGO_IMG);
            }
            if (formData.RAMS_DELIVERIES_IMG) {
                formDataToSend.append('RAMS_DELIVERIES_IMG', formData.RAMS_DELIVERIES_IMG);
            }

            // Use the access/submit endpoint which triggers doc generation
            const res = await fetch('/api/access/submit', {
                method: 'POST',
                body: formDataToSend,
                redirect: 'manual', // Don't auto-follow redirects
            });

            // Save RAMS-specific profile defaults (fire and forget)
            if (email) {
                fetch('/api/profile/defaults', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        product: 'RAMS',
                        defaults: {
                            RAMS_COMPANY_NAME: formData.RAMS_COMPANY_NAME,
                            RAMS_COMPANY_PHONE: formData.RAMS_COMPANY_PHONE,
                            RAMS_COMPANY_EMAIL: formData.RAMS_COMPANY_EMAIL,
                            permits: formData.permits,
                        },
                    }),
                }).catch((err) => console.error('Failed to save defaults:', err));
            }

            // Handle redirect to thank you page
            if (res.status === 303 || res.status === 302 || res.status === 307) {
                const redirectUrl = res.headers.get('Location');
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                    return;
                }
            }

            // If response is OK (200), check for redirect in body
            if (res.ok) {
                // The API responded with success, redirect manually
                const url = new URL(window.location.href);
                // Try to get submission ID from response if available
                try {
                    const data = await res.json();
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                        return;
                    }
                } catch {
                    // No JSON response, just show success
                }
                setSubmitSuccess(true);
                return;
            }

            throw new Error('Submission failed');
        } catch (err) {
            console.error('Form submission error:', err);
            setErrors({ RAMS_TITLE: 'Failed to submit form. Please try again.' });
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

                {/* Customer Email (readonly) */}
                <FormInput
                    label="Customer Email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="opacity-60"
                />

                {/* Project Basics */}
                <FormSection title="Project Basics">
                    <FormInput
                        label="RAMS Title / Job Description"
                        placeholder="e.g., RAMS 01 – Finsbury Bower - Beam Installation"
                        value={formData.RAMS_TITLE}
                        onChange={(e) => updateField('RAMS_TITLE', e.target.value)}
                        required
                        error={errors.RAMS_TITLE}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormInput
                            label="Anticipated Start Date"
                            type="date"
                            value={formData.RAMS_START_DATE}
                            onChange={(e) => updateField('RAMS_START_DATE', e.target.value)}
                            required
                            error={errors.RAMS_START_DATE}
                        />
                        <FormInput
                            label="Duration of Works"
                            placeholder="e.g., 3 weeks"
                            value={formData.RAMS_DURATION}
                            onChange={(e) => updateField('RAMS_DURATION', e.target.value)}
                            required
                            error={errors.RAMS_DURATION}
                        />
                    </div>
                </FormSection>

                {/* Company Details */}
                <FormSection title="Company Details">
                    <FormInput
                        label="Company Name"
                        placeholder="Your company name"
                        value={formData.RAMS_COMPANY_NAME}
                        onChange={(e) => updateField('RAMS_COMPANY_NAME', e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormInput
                            label="Phone"
                            type="tel"
                            placeholder="Company phone"
                            value={formData.RAMS_COMPANY_PHONE}
                            onChange={(e) => updateField('RAMS_COMPANY_PHONE', e.target.value)}
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            placeholder="Company email"
                            value={formData.RAMS_COMPANY_EMAIL}
                            onChange={(e) => updateField('RAMS_COMPANY_EMAIL', e.target.value)}
                        />
                    </div>
                    <FileUploadField
                        label="Company Logo"
                        description="Optional - upload your company logo"
                        accept="image/*"
                        value={formData.RAMS_COMPANY_LOGO_IMG}
                        onChange={(file) => updateField('RAMS_COMPANY_LOGO_IMG', file)}
                        optional
                    />
                </FormSection>

                {/* Site Details */}
                <FormSection title="Site Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Site Address Line 1"
                            placeholder="Street and number"
                            value={formData.RAMS_SITE_ADDRESS_LINE1}
                            onChange={(e) => updateField('RAMS_SITE_ADDRESS_LINE1', e.target.value)}
                            required
                            error={errors.RAMS_SITE_ADDRESS_LINE1}
                        />
                        <FormInput
                            label="Site Address Line 2"
                            placeholder="Optional"
                            value={formData.RAMS_SITE_ADDRESS_LINE2}
                            onChange={(e) => updateField('RAMS_SITE_ADDRESS_LINE2', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormInput
                            label="City"
                            placeholder="City"
                            value={formData.RAMS_SITE_CITY}
                            onChange={(e) => updateField('RAMS_SITE_CITY', e.target.value)}
                            required
                            error={errors.RAMS_SITE_CITY}
                        />
                        <FormInput
                            label="Postcode"
                            placeholder="Postcode"
                            value={formData.RAMS_SITE_POSTCODE}
                            onChange={(e) => updateField('RAMS_SITE_POSTCODE', e.target.value)}
                        />
                        <FormInput
                            label="Country"
                            placeholder="Country"
                            value={formData.RAMS_SITE_COUNTRY}
                            onChange={(e) => updateField('RAMS_SITE_COUNTRY', e.target.value)}
                        />
                    </div>
                </FormSection>

                {/* Deliveries */}
                <FormSection title="Deliveries">
                    <FormTextarea
                        label="Deliveries Text"
                        placeholder="Describe deliveries and logistics, or 'As per Client CPP and Induction'"
                        value={formData.RAMS_DELIVERIES_TEXT}
                        onChange={(e) => updateField('RAMS_DELIVERIES_TEXT', e.target.value)}
                    />
                    <FileUploadField
                        label="Deliveries Image"
                        description="Optional - upload a traffic management plan or site layout"
                        accept="image/*"
                        value={formData.RAMS_DELIVERIES_IMG}
                        onChange={(file) => updateField('RAMS_DELIVERIES_IMG', file)}
                        optional
                    />
                </FormSection>

                {/* Emergency Contacts */}
                <FormSection title="Emergency Contacts">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="First Aiders"
                            placeholder="Names of first aiders on site"
                            value={formData.RAMS_FIRST_AIDERS}
                            onChange={(e) => updateField('RAMS_FIRST_AIDERS', e.target.value)}
                        />
                        <FormInput
                            label="Fire Marshalls"
                            placeholder="Names of fire marshalls on site"
                            value={formData.RAMS_FIRE_MARSHALLS}
                            onChange={(e) => updateField('RAMS_FIRE_MARSHALLS', e.target.value)}
                        />
                    </div>
                </FormSection>

                {/* Permits Required */}
                <FormSection title="Permits Required" description="Select all that apply (saved for future use)">
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
                    title="Works Description (AI Input)"
                    description="Describe the works, constraints, and key hazards. The more detail, the better."
                >
                    <FormTextarea
                        label="Description"
                        placeholder="e.g., Write me a risk assessment and method statement for beam installation involving temporary jacks using a crawler crane. Key hazards include working at height, crane operations near live traffic..."
                        value={formData.aiTaskDescription}
                        onChange={(e) => updateField('aiTaskDescription', e.target.value)}
                        required
                        error={errors.aiTaskDescription}
                        className="min-h-[140px]"
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
