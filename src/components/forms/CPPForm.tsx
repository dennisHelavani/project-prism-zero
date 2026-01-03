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

type DeliveriesOption = 'not-applicable' | 'text' | 'upload';

// Form data keys match template placeholder names exactly
type CPPFormData = {
    // Customer
    email: string;

    // Company Details
    CPP_COMPANY_NAME: string;
    CPP_COMPANY_ADDRESS_LINE1: string;
    CPP_COMPANY_ADDRESS_LINE2: string;
    CPP_COMPANY_CITY: string;
    CPP_COMPANY_POSTCODE: string;
    CPP_COMPANY_COUNTRY: string;
    CPP_COMPANY_PHONE: string;
    CPP_COMPANY_EMAIL: string;

    // Project Details
    CPP_PROJECT_TITLE: string;
    CPP_WRITTEN_REVIEWED_BY: string;
    CPP_REVISION: string;
    CPP_START_DATE: string;
    CPP_DURATION: string;
    CPP_PROJECT_NUMBER: string;
    CPP_F10_REF: string;

    // Site Address
    CPP_SITE_ADDRESS_LINE1: string;
    CPP_SITE_ADDRESS_LINE2: string;
    CPP_SITE_CITY: string;
    CPP_SITE_POSTCODE: string;
    CPP_SITE_COUNTRY: string;

    // Task / Activity
    CPP_TASK_ACTIVITY: string;

    // Deliveries
    deliveriesOption: DeliveriesOption;
    CPP_DELIVERIES_TEXT: string;

    // Files (optional)
    CPP_COMPANY_LOGO_IMG: File | null;
    CPP_DELIVERIES_IMG: File | null;
};

const initialFormData: CPPFormData = {
    email: '',
    CPP_COMPANY_NAME: '',
    CPP_COMPANY_ADDRESS_LINE1: '',
    CPP_COMPANY_ADDRESS_LINE2: '',
    CPP_COMPANY_CITY: '',
    CPP_COMPANY_POSTCODE: '',
    CPP_COMPANY_COUNTRY: '',
    CPP_COMPANY_PHONE: '',
    CPP_COMPANY_EMAIL: '',
    CPP_PROJECT_TITLE: '',
    CPP_WRITTEN_REVIEWED_BY: '',
    CPP_REVISION: '',
    CPP_START_DATE: '',
    CPP_DURATION: '',
    CPP_PROJECT_NUMBER: '',
    CPP_F10_REF: '',
    CPP_SITE_ADDRESS_LINE1: '',
    CPP_SITE_ADDRESS_LINE2: '',
    CPP_SITE_CITY: '',
    CPP_SITE_POSTCODE: '',
    CPP_SITE_COUNTRY: '',
    CPP_TASK_ACTIVITY: '',
    deliveriesOption: 'not-applicable',
    CPP_DELIVERIES_TEXT: '',
    CPP_COMPANY_LOGO_IMG: null,
    CPP_DELIVERIES_IMG: null,
};

type Props = {
    email: string | null;
    code: string | null;
    expiresAt?: string;
};

export default function CPPForm({ email, code }: Props) {
    const [formData, setFormData] = React.useState<CPPFormData>({
        ...initialFormData,
        email: email ?? '',
    });
    const [errors, setErrors] = React.useState<Partial<Record<keyof CPPFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showWarning, setShowWarning] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [isLoadingDefaults, setIsLoadingDefaults] = React.useState(false);

    // Load CPP-specific profile defaults on mount
    React.useEffect(() => {
        if (!email) return;

        const loadDefaults = async () => {
            setIsLoadingDefaults(true);
            try {
                const res = await fetch(`/api/profile/defaults?email=${encodeURIComponent(email)}&product=CPP`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaults) {
                        setFormData((prev) => ({
                            ...prev,
                            CPP_COMPANY_NAME: data.defaults.CPP_COMPANY_NAME || prev.CPP_COMPANY_NAME,
                            CPP_COMPANY_ADDRESS_LINE1: data.defaults.CPP_COMPANY_ADDRESS_LINE1 || prev.CPP_COMPANY_ADDRESS_LINE1,
                            CPP_COMPANY_ADDRESS_LINE2: data.defaults.CPP_COMPANY_ADDRESS_LINE2 || prev.CPP_COMPANY_ADDRESS_LINE2,
                            CPP_COMPANY_CITY: data.defaults.CPP_COMPANY_CITY || prev.CPP_COMPANY_CITY,
                            CPP_COMPANY_POSTCODE: data.defaults.CPP_COMPANY_POSTCODE || prev.CPP_COMPANY_POSTCODE,
                            CPP_COMPANY_COUNTRY: data.defaults.CPP_COMPANY_COUNTRY || prev.CPP_COMPANY_COUNTRY,
                            CPP_COMPANY_PHONE: data.defaults.CPP_COMPANY_PHONE || prev.CPP_COMPANY_PHONE,
                            CPP_COMPANY_EMAIL: data.defaults.CPP_COMPANY_EMAIL || prev.CPP_COMPANY_EMAIL,
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

    const updateField = <K extends keyof CPPFormData>(key: K, value: CPPFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CPPFormData, string>> = {};

        if (!formData.CPP_PROJECT_TITLE.trim()) {
            newErrors.CPP_PROJECT_TITLE = 'Project title is required';
        }
        if (!formData.CPP_START_DATE) {
            newErrors.CPP_START_DATE = 'Start date is required';
        }
        if (!formData.CPP_DURATION.trim()) {
            newErrors.CPP_DURATION = 'Duration is required';
        }
        if (!formData.CPP_SITE_ADDRESS_LINE1.trim()) {
            newErrors.CPP_SITE_ADDRESS_LINE1 = 'Site address is required';
        }
        if (!formData.CPP_SITE_CITY.trim()) {
            newErrors.CPP_SITE_CITY = 'Site city is required';
        }
        if (!formData.CPP_TASK_ACTIVITY.trim()) {
            newErrors.CPP_TASK_ACTIVITY = 'Task/activity description is required';
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

        const dateStamped = new Date().toISOString().split('T')[0];

        try {
            // Build placeholders object with exact keys
            const placeholders: Record<string, string> = {
                CPP_PROJECT_TITLE: formData.CPP_PROJECT_TITLE,
                CPP_COMPANY_NAME: formData.CPP_COMPANY_NAME,
                CPP_COMPANY_ADDRESS_LINE1: formData.CPP_COMPANY_ADDRESS_LINE1,
                CPP_COMPANY_ADDRESS_LINE2: formData.CPP_COMPANY_ADDRESS_LINE2,
                CPP_COMPANY_CITY: formData.CPP_COMPANY_CITY,
                CPP_COMPANY_POSTCODE: formData.CPP_COMPANY_POSTCODE,
                CPP_COMPANY_COUNTRY: formData.CPP_COMPANY_COUNTRY,
                CPP_COMPANY_PHONE: formData.CPP_COMPANY_PHONE,
                CPP_COMPANY_EMAIL: formData.CPP_COMPANY_EMAIL,
                CPP_WRITTEN_REVIEWED_BY: formData.CPP_WRITTEN_REVIEWED_BY,
                CPP_REVISION: formData.CPP_REVISION,
                CPP_START_DATE: formData.CPP_START_DATE,
                CPP_DURATION: formData.CPP_DURATION,
                CPP_PROJECT_NUMBER: formData.CPP_PROJECT_NUMBER,
                CPP_F10_REF: formData.CPP_F10_REF,
                CPP_SITE_ADDRESS_LINE1: formData.CPP_SITE_ADDRESS_LINE1,
                CPP_SITE_ADDRESS_LINE2: formData.CPP_SITE_ADDRESS_LINE2,
                CPP_SITE_CITY: formData.CPP_SITE_CITY,
                CPP_SITE_POSTCODE: formData.CPP_SITE_POSTCODE,
                CPP_SITE_COUNTRY: formData.CPP_SITE_COUNTRY,
                CPP_TASK_ACTIVITY: formData.CPP_TASK_ACTIVITY,
                CPP_DELIVERIES_TEXT: formData.deliveriesOption === 'text' ? formData.CPP_DELIVERIES_TEXT : '',
                CPP_DATE_STAMPED: dateStamped,
            };

            const formDataToSend = new FormData();
            formDataToSend.append('product', 'CPP');
            formDataToSend.append('code', code ?? '');
            formDataToSend.append('email', email ?? '');
            formDataToSend.append('placeholders', JSON.stringify(placeholders));

            // Add optional uploads
            if (formData.CPP_COMPANY_LOGO_IMG) {
                formDataToSend.append('CPP_COMPANY_LOGO_IMG', formData.CPP_COMPANY_LOGO_IMG);
            }
            if (formData.deliveriesOption === 'upload' && formData.CPP_DELIVERIES_IMG) {
                formDataToSend.append('CPP_DELIVERIES_IMG', formData.CPP_DELIVERIES_IMG);
            }

            // Use the access/submit endpoint which triggers doc generation
            const res = await fetch('/api/access/submit', {
                method: 'POST',
                body: formDataToSend,
                redirect: 'manual', // Don't auto-follow redirects
            });

            // Save CPP-specific profile defaults (fire and forget)
            if (email) {
                fetch('/api/profile/defaults', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        product: 'CPP',
                        defaults: {
                            CPP_COMPANY_NAME: formData.CPP_COMPANY_NAME,
                            CPP_COMPANY_ADDRESS_LINE1: formData.CPP_COMPANY_ADDRESS_LINE1,
                            CPP_COMPANY_ADDRESS_LINE2: formData.CPP_COMPANY_ADDRESS_LINE2,
                            CPP_COMPANY_CITY: formData.CPP_COMPANY_CITY,
                            CPP_COMPANY_POSTCODE: formData.CPP_COMPANY_POSTCODE,
                            CPP_COMPANY_COUNTRY: formData.CPP_COMPANY_COUNTRY,
                            CPP_COMPANY_PHONE: formData.CPP_COMPANY_PHONE,
                            CPP_COMPANY_EMAIL: formData.CPP_COMPANY_EMAIL,
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
            setErrors({ CPP_PROJECT_TITLE: 'Failed to submit form. Please try again.' });
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
                        Your CPP is on the way!<br />
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
                    <h2 className="text-xl font-bold text-white">Construction Phase Plan Generator</h2>
                    <p className="text-sm text-white/60">
                        Fill in the key information below. AI will generate the rest of your CPP document.
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

                {/* Company Details */}
                <FormSection title="Company Details" description="Saved for future use">
                    <FormInput
                        label="Company Name"
                        placeholder="Your company name"
                        value={formData.CPP_COMPANY_NAME}
                        onChange={(e) => updateField('CPP_COMPANY_NAME', e.target.value)}
                    />
                    <FileUploadField
                        label="Company Logo"
                        description="Optional - upload your company logo"
                        accept="image/*"
                        value={formData.CPP_COMPANY_LOGO_IMG}
                        onChange={(file) => updateField('CPP_COMPANY_LOGO_IMG', file)}
                        optional
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormInput
                            label="Address Line 1"
                            placeholder="Street and house number"
                            value={formData.CPP_COMPANY_ADDRESS_LINE1}
                            onChange={(e) => updateField('CPP_COMPANY_ADDRESS_LINE1', e.target.value)}
                        />
                        <FormInput
                            label="Address Line 2"
                            placeholder="Optional"
                            value={formData.CPP_COMPANY_ADDRESS_LINE2}
                            onChange={(e) => updateField('CPP_COMPANY_ADDRESS_LINE2', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormInput
                            label="City"
                            placeholder="City"
                            value={formData.CPP_COMPANY_CITY}
                            onChange={(e) => updateField('CPP_COMPANY_CITY', e.target.value)}
                        />
                        <FormInput
                            label="Postcode"
                            placeholder="Postcode"
                            value={formData.CPP_COMPANY_POSTCODE}
                            onChange={(e) => updateField('CPP_COMPANY_POSTCODE', e.target.value)}
                        />
                        <FormInput
                            label="Country"
                            placeholder="Country"
                            value={formData.CPP_COMPANY_COUNTRY}
                            onChange={(e) => updateField('CPP_COMPANY_COUNTRY', e.target.value)}
                        />
                        <FormInput
                            label="Phone"
                            type="tel"
                            placeholder="Phone number"
                            value={formData.CPP_COMPANY_PHONE}
                            onChange={(e) => updateField('CPP_COMPANY_PHONE', e.target.value)}
                        />
                    </div>
                    <FormInput
                        label="Company Email"
                        type="email"
                        placeholder="Company email address"
                        value={formData.CPP_COMPANY_EMAIL}
                        onChange={(e) => updateField('CPP_COMPANY_EMAIL', e.target.value)}
                    />
                </FormSection>

                {/* Project Details */}
                <FormSection title="Project Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project Title"
                            placeholder="e.g., 10-Storey Commercial Building"
                            value={formData.CPP_PROJECT_TITLE}
                            onChange={(e) => updateField('CPP_PROJECT_TITLE', e.target.value)}
                            required
                            error={errors.CPP_PROJECT_TITLE}
                        />
                        <FormInput
                            label="Project Number"
                            placeholder="Reference number"
                            value={formData.CPP_PROJECT_NUMBER}
                            onChange={(e) => updateField('CPP_PROJECT_NUMBER', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Written / Reviewed By"
                            placeholder="Name"
                            value={formData.CPP_WRITTEN_REVIEWED_BY}
                            onChange={(e) => updateField('CPP_WRITTEN_REVIEWED_BY', e.target.value)}
                        />
                        <FormInput
                            label="Revision"
                            placeholder="e.g., Rev 1"
                            value={formData.CPP_REVISION}
                            onChange={(e) => updateField('CPP_REVISION', e.target.value)}
                        />
                        <FormInput
                            label="F10 Notification Ref"
                            placeholder="Optional"
                            value={formData.CPP_F10_REF}
                            onChange={(e) => updateField('CPP_F10_REF', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Anticipated Start Date"
                            type="date"
                            value={formData.CPP_START_DATE}
                            onChange={(e) => updateField('CPP_START_DATE', e.target.value)}
                            required
                            error={errors.CPP_START_DATE}
                        />
                        <FormInput
                            label="Duration of Works"
                            placeholder="e.g., 6 months"
                            value={formData.CPP_DURATION}
                            onChange={(e) => updateField('CPP_DURATION', e.target.value)}
                            required
                            error={errors.CPP_DURATION}
                        />
                    </div>
                </FormSection>

                {/* Site Details */}
                <FormSection title="Site Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Site Address Line 1"
                            placeholder="Street and number"
                            value={formData.CPP_SITE_ADDRESS_LINE1}
                            onChange={(e) => updateField('CPP_SITE_ADDRESS_LINE1', e.target.value)}
                            required
                            error={errors.CPP_SITE_ADDRESS_LINE1}
                        />
                        <FormInput
                            label="Site Address Line 2"
                            placeholder="Optional"
                            value={formData.CPP_SITE_ADDRESS_LINE2}
                            onChange={(e) => updateField('CPP_SITE_ADDRESS_LINE2', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormInput
                            label="City"
                            placeholder="City"
                            value={formData.CPP_SITE_CITY}
                            onChange={(e) => updateField('CPP_SITE_CITY', e.target.value)}
                            required
                            error={errors.CPP_SITE_CITY}
                        />
                        <FormInput
                            label="Postcode"
                            placeholder="Postcode"
                            value={formData.CPP_SITE_POSTCODE}
                            onChange={(e) => updateField('CPP_SITE_POSTCODE', e.target.value)}
                        />
                        <FormInput
                            label="Country"
                            placeholder="Country"
                            value={formData.CPP_SITE_COUNTRY}
                            onChange={(e) => updateField('CPP_SITE_COUNTRY', e.target.value)}
                        />
                    </div>
                </FormSection>

                {/* Task / Activity */}
                <FormSection
                    title="Project Task / Activity"
                    description="This description drives the AI-generated content"
                >
                    <FormTextarea
                        label="Description"
                        placeholder="e.g., 10-Storey Commercial Building with Cat A + Cat B interfaces. Include any key constraints or hazards..."
                        value={formData.CPP_TASK_ACTIVITY}
                        onChange={(e) => updateField('CPP_TASK_ACTIVITY', e.target.value)}
                        required
                        error={errors.CPP_TASK_ACTIVITY}
                        className="min-h-[120px]"
                    />
                </FormSection>

                {/* Deliveries */}
                <FormSection title="Deliveries">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveriesOption"
                                    value="not-applicable"
                                    checked={formData.deliveriesOption === 'not-applicable'}
                                    onChange={() => updateField('deliveriesOption', 'not-applicable')}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-white/90">Not applicable</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveriesOption"
                                    value="text"
                                    checked={formData.deliveriesOption === 'text'}
                                    onChange={() => updateField('deliveriesOption', 'text')}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-white/90">Provide text instructions</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveriesOption"
                                    value="upload"
                                    checked={formData.deliveriesOption === 'upload'}
                                    onChange={() => updateField('deliveriesOption', 'upload')}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-white/90">Upload traffic management plan</span>
                            </label>
                        </div>

                        {formData.deliveriesOption === 'text' && (
                            <FormTextarea
                                label="Deliveries Instructions"
                                placeholder="Describe traffic management and deliveries..."
                                value={formData.CPP_DELIVERIES_TEXT}
                                onChange={(e) => updateField('CPP_DELIVERIES_TEXT', e.target.value)}
                            />
                        )}

                        {formData.deliveriesOption === 'upload' && (
                            <FileUploadField
                                label="Traffic Management Plan"
                                description="Optional - upload an image"
                                accept="image/*"
                                value={formData.CPP_DELIVERIES_IMG}
                                onChange={(file) => updateField('CPP_DELIVERIES_IMG', file)}
                                optional
                            />
                        )}
                    </div>
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
                                Generate CPP
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormCard>
    );
}
