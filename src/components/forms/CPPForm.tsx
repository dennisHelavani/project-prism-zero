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

type CPPFormData = {
    // Sign-off
    email: string;
    approvedByName: string;
    dateStamped: string;

    // Company Details (saved as defaults)
    companyName: string;
    companyAddressLine1: string;
    companyAddressLine2: string;
    companyCity: string;
    companyPostcode: string;
    companyCountry: string;
    companyPhone: string;
    companyEmail: string;

    // Project Key Info
    projectTitle: string;
    writtenBy: string;
    revision: string;
    dateStart: string;
    duration: string;
    projectNumber: string;
    f10Ref: string;
    siteAddressLine1: string;
    siteAddressLine2: string;
    siteCity: string;
    sitePostcode: string;
    siteCountry: string;
    projectTask: string;

    // Deliveries
    deliveriesOption: DeliveriesOption;
    deliveriesNote: string;

    // Files
    companyLogo: File | null;
    deliveriesImage: File | null;
};

const initialFormData: CPPFormData = {
    email: '',
    approvedByName: '',
    dateStamped: '',
    companyName: '',
    companyAddressLine1: '',
    companyAddressLine2: '',
    companyCity: '',
    companyPostcode: '',
    companyCountry: '',
    companyPhone: '',
    companyEmail: '',
    projectTitle: '',
    writtenBy: '',
    revision: '',
    dateStart: '',
    duration: '',
    projectNumber: '',
    f10Ref: '',
    siteAddressLine1: '',
    siteAddressLine2: '',
    siteCity: '',
    sitePostcode: '',
    siteCountry: '',
    projectTask: '',
    deliveriesOption: 'not-applicable',
    deliveriesNote: '',
    companyLogo: null,
    deliveriesImage: null,
};

type Props = {
    email: string | null;
    code: string | null;
    expiresAt?: string;
};

export default function CPPForm({ email, code, expiresAt }: Props) {
    const [formData, setFormData] = React.useState<CPPFormData>({
        ...initialFormData,
        email: email ?? '',
    });
    const [errors, setErrors] = React.useState<Partial<Record<keyof CPPFormData, string>>>({});
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
                            companyName: data.defaults.companyName || prev.companyName,
                            companyAddressLine1: data.defaults.companyAddressLine1 || prev.companyAddressLine1,
                            companyAddressLine2: data.defaults.companyAddressLine2 || prev.companyAddressLine2,
                            companyCity: data.defaults.companyCity || prev.companyCity,
                            companyPostcode: data.defaults.companyPostcode || prev.companyPostcode,
                            companyCountry: data.defaults.companyCountry || prev.companyCountry,
                            companyPhone: data.defaults.companyPhone || prev.companyPhone,
                            companyEmail: data.defaults.companyEmail || prev.companyEmail,
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

        if (!formData.projectTitle.trim()) {
            newErrors.projectTitle = 'Project title is required';
        }
        if (!formData.dateStart) {
            newErrors.dateStart = 'Start date is required';
        }
        if (!formData.siteAddressLine1.trim()) {
            newErrors.siteAddressLine1 = 'Site address is required';
        }
        if (!formData.siteCity.trim()) {
            newErrors.siteCity = 'Site city is required';
        }
        if (!formData.projectTask.trim()) {
            newErrors.projectTask = 'Project task description is required';
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
            const formDataToSend = new FormData();
            formDataToSend.append('product', 'CPP');
            formDataToSend.append('code', code ?? '');
            formDataToSend.append('dateStamped', dateStamped);

            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataToSend.append(key, value);
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
                            companyName: formData.companyName,
                            companyAddressLine1: formData.companyAddressLine1,
                            companyAddressLine2: formData.companyAddressLine2,
                            companyCity: formData.companyCity,
                            companyPostcode: formData.companyPostcode,
                            companyCountry: formData.companyCountry,
                            companyPhone: formData.companyPhone,
                            companyEmail: formData.companyEmail,
                        },
                    }),
                }).catch((err) => console.error('Failed to save defaults:', err));
            }

            setSubmitSuccess(true);
        } catch (err) {
            console.error('Form submission error:', err);
            setErrors({ projectTitle: 'Failed to submit form. Please try again.' });
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

                {/* Sign-off Section */}
                <FormSection title="Sign-off">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Approved By"
                            placeholder="Name"
                            value={formData.approvedByName}
                            onChange={(e) => updateField('approvedByName', e.target.value)}
                        />
                        <FormInput
                            label="Date Stamped"
                            type="text"
                            value="Auto-generated on submission"
                            readOnly
                            className="opacity-60"
                        />
                        <FormInput
                            label="Customer Email"
                            type="email"
                            value={formData.email}
                            readOnly
                            className="opacity-60"
                        />
                    </div>
                </FormSection>

                {/* Company Details Section */}
                <FormSection title="Company Details" description="These will be saved for future use">
                    <FormInput
                        label="Company Name"
                        placeholder="Your company name"
                        value={formData.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                    />
                    <FileUploadField
                        label="Company Logo"
                        description="Upload your company logo (optional)"
                        accept="image/*"
                        value={formData.companyLogo}
                        onChange={(file) => updateField('companyLogo', file)}
                        optional
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormInput
                            label="Address Line 1"
                            placeholder="Street and house number"
                            value={formData.companyAddressLine1}
                            onChange={(e) => updateField('companyAddressLine1', e.target.value)}
                        />
                        <FormInput
                            label="Address Line 2"
                            placeholder="Optional"
                            value={formData.companyAddressLine2}
                            onChange={(e) => updateField('companyAddressLine2', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormInput
                            label="City"
                            placeholder="City"
                            value={formData.companyCity}
                            onChange={(e) => updateField('companyCity', e.target.value)}
                        />
                        <FormInput
                            label="Postcode"
                            placeholder="Postcode"
                            value={formData.companyPostcode}
                            onChange={(e) => updateField('companyPostcode', e.target.value)}
                        />
                        <FormInput
                            label="Country"
                            placeholder="Country"
                            value={formData.companyCountry}
                            onChange={(e) => updateField('companyCountry', e.target.value)}
                        />
                        <FormInput
                            label="Phone"
                            type="tel"
                            placeholder="Phone number"
                            value={formData.companyPhone}
                            onChange={(e) => updateField('companyPhone', e.target.value)}
                        />
                    </div>
                    <FormInput
                        label="Company Email"
                        type="email"
                        placeholder="Company email address"
                        value={formData.companyEmail}
                        onChange={(e) => updateField('companyEmail', e.target.value)}
                    />
                </FormSection>

                {/* Project Key Info Section */}
                <FormSection title="Project Key Info">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project Title"
                            placeholder="e.g., 10-Storey Commercial Building"
                            value={formData.projectTitle}
                            onChange={(e) => updateField('projectTitle', e.target.value)}
                            required
                            error={errors.projectTitle}
                        />
                        <FormInput
                            label="Project Number"
                            placeholder="Reference number"
                            value={formData.projectNumber}
                            onChange={(e) => updateField('projectNumber', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Written / Reviewed By"
                            placeholder="Name"
                            value={formData.writtenBy}
                            onChange={(e) => updateField('writtenBy', e.target.value)}
                        />
                        <FormInput
                            label="Revision"
                            placeholder="e.g., Rev 1"
                            value={formData.revision}
                            onChange={(e) => updateField('revision', e.target.value)}
                        />
                        <FormInput
                            label="F10 Notification Ref"
                            placeholder="If applicable"
                            value={formData.f10Ref}
                            onChange={(e) => updateField('f10Ref', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="e.g., 6 months"
                            value={formData.duration}
                            onChange={(e) => updateField('duration', e.target.value)}
                        />
                    </div>

                    {/* Site Address */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm font-medium text-white/80 mb-3">Site Address</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Address Line 1"
                                placeholder="Street and number"
                                value={formData.siteAddressLine1}
                                onChange={(e) => updateField('siteAddressLine1', e.target.value)}
                                required
                                error={errors.siteAddressLine1}
                            />
                            <FormInput
                                label="Address Line 2"
                                placeholder="Optional"
                                value={formData.siteAddressLine2}
                                onChange={(e) => updateField('siteAddressLine2', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <FormInput
                                label="City"
                                placeholder="City"
                                value={formData.siteCity}
                                onChange={(e) => updateField('siteCity', e.target.value)}
                                required
                                error={errors.siteCity}
                            />
                            <FormInput
                                label="Postcode"
                                placeholder="Postcode"
                                value={formData.sitePostcode}
                                onChange={(e) => updateField('sitePostcode', e.target.value)}
                            />
                            <FormInput
                                label="Country"
                                placeholder="Country"
                                value={formData.siteCountry}
                                onChange={(e) => updateField('siteCountry', e.target.value)}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* Project Task / Activity */}
                <FormSection
                    title="Project Task / Activity"
                    description="This description drives the AI-generated content"
                >
                    <FormTextarea
                        label="Description"
                        placeholder="e.g., 10-Storey Commercial Building with Cat A + Cat B interfaces. Include any key constraints or hazards..."
                        value={formData.projectTask}
                        onChange={(e) => updateField('projectTask', e.target.value)}
                        required
                        error={errors.projectTask}
                        className="min-h-[120px]"
                    />
                </FormSection>

                {/* Deliveries Section */}
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
                                <span className="text-white/90">Text instructions</span>
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
                                value={formData.deliveriesNote}
                                onChange={(e) => updateField('deliveriesNote', e.target.value)}
                            />
                        )}

                        {formData.deliveriesOption === 'upload' && (
                            <FileUploadField
                                label="Traffic Management Plan"
                                description="Upload an image of your traffic management plan"
                                accept="image/*"
                                value={formData.deliveriesImage}
                                onChange={(file) => updateField('deliveriesImage', file)}
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
