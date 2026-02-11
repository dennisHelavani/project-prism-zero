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
    CPP_COMPANY_ADDRESS_LINE1: string; // Street Name
    CPP_COMPANY_A_BN: string; // Building Number
    CPP_COMPANY_ADDRESS_LINE2: string; // Neighborhood/Area
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
    CPP_SITE_ADDRESS_LINE1: string; // Street Name
    CPP_SITE_A_BN: string; // Building Number
    CPP_SITE_ADDRESS_LINE2: string; // Neighborhood/Area
    CPP_SITE_CITY: string;
    CPP_SITE_POSTCODE: string;
    CPP_SITE_COUNTRY: string;

    // Task / Activity
    CPP_TASK_ACTIVITY: string;

    // Smart Work Type Toggles (for Blue Flag logic)
    TOGGLE_EXTERNAL_GROUNDWORKS: boolean;  // Maps to hoarding, laydown
    TOGGLE_HEIGHT_STRUCTURAL: boolean;     // Maps to competence, scaffolding
    TOGGLE_PUBLIC_ROAD_IMPACT: boolean;    // Maps to traffic mgmt
    TOGGLE_MEP_COMMISSIONING: boolean;     // Maps to section 17

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
    CPP_COMPANY_A_BN: '',
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
    CPP_SITE_A_BN: '',
    CPP_SITE_ADDRESS_LINE2: '',
    CPP_SITE_CITY: '',
    CPP_SITE_POSTCODE: '',
    CPP_SITE_COUNTRY: '',
    CPP_TASK_ACTIVITY: '',
    // Smart Toggles - default to false (user selects what applies)
    TOGGLE_EXTERNAL_GROUNDWORKS: false,
    TOGGLE_HEIGHT_STRUCTURAL: false,
    TOGGLE_PUBLIC_ROAD_IMPACT: false,
    TOGGLE_MEP_COMMISSIONING: false,
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
    const [showValidationError, setShowValidationError] = React.useState(false);
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

    const updateField = <K extends keyof CPPFormData>(field: K, value: CPPFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // UK phone number formatter
    const formatUKPhone = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');

        // If starts with 44, use that as prefix
        if (digits.startsWith('44')) {
            const rest = digits.slice(2);
            if (rest.length <= 2) return `+44(0)${rest}`;
            if (rest.length <= 6) return `+44(0)${rest.slice(0, 2)} ${rest.slice(2)}`;
            return `+44(0)${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
        }

        // Otherwise assume UK local number, add +44(0) prefix
        if (digits.length === 0) return '';
        if (digits.length <= 2) return `+44(0)${digits}`;
        if (digits.length <= 5) return `+44(0)${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `+44(0)${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    };

    const handlePhoneChange = (field: 'CPP_COMPANY_PHONE', value: string) => {
        const formatted = formatUKPhone(value);
        updateField(field, formatted);
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
            setShowValidationError(false);
            setShowWarning(true);
        } else {
            setShowValidationError(true);
            // Scroll to first error field
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                const element = document.querySelector(`[name="${firstErrorKey}"]`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setShowWarning(false);

        const dateStamped = new Date().toISOString().split('T')[0];

        // Get current UK time (HH:mm format)
        const ukTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/London',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date());

        try {
            // Build placeholders object with exact keys
            const placeholders: Record<string, string> = {
                CPP_PROJECT_TITLE: formData.CPP_PROJECT_TITLE,
                CPP_TITLE: formData.CPP_PROJECT_TITLE, // Alias for template compatibility
                CPP_COMPANY_NAME: formData.CPP_COMPANY_NAME,
                CPP_COMPANY_ADDRESS_LINE1: formData.CPP_COMPANY_ADDRESS_LINE1,
                CPP_COMPANY_A_BN: formData.CPP_COMPANY_A_BN,
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
                CPP_SITE_A_BN: formData.CPP_SITE_A_BN,
                CPP_SITE_ADDRESS_LINE2: formData.CPP_SITE_ADDRESS_LINE2,
                CPP_SITE_CITY: formData.CPP_SITE_CITY,
                CPP_SITE_POSTCODE: formData.CPP_SITE_POSTCODE,
                CPP_SITE_COUNTRY: formData.CPP_SITE_COUNTRY,
                CPP_TASK_ACTIVITY: formData.CPP_TASK_ACTIVITY,
                CPP_DELIVERIES_TEXT: formData.deliveriesOption === 'text' ? formData.CPP_DELIVERIES_TEXT : '',
                CPP_DATE_STAMPED: dateStamped,
                CPP_DATE_TIME: ukTime,
                // Smart Work Type Toggles for Blue Flag logic
                TOGGLE_EXTERNAL_GROUNDWORKS: String(formData.TOGGLE_EXTERNAL_GROUNDWORKS),
                TOGGLE_HEIGHT_STRUCTURAL: String(formData.TOGGLE_HEIGHT_STRUCTURAL),
                TOGGLE_PUBLIC_ROAD_IMPACT: String(formData.TOGGLE_PUBLIC_ROAD_IMPACT),
                TOGGLE_MEP_COMMISSIONING: String(formData.TOGGLE_MEP_COMMISSIONING),
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

            // Handle JSON response with redirect URL
            if (res.ok) {
                const data = await res.json();
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                    return;
                }
                // Fallback to success state if no redirect URL
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

                {/* SECTION: Company Information */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Company Information</h3>
                            <p className="text-sm text-muted-foreground">Saved for future use</p>
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
                        <FormInput
                            label="Company Name"
                            placeholder="Your company name"
                            value={formData.CPP_COMPANY_NAME}
                            onChange={(e) => updateField('CPP_COMPANY_NAME', e.target.value)}
                        />
                        <FileUploadField
                            label="Company Logo"
                            description="PNG or JPG, max 5MB"
                            accept="image/png,image/jpeg"
                            value={formData.CPP_COMPANY_LOGO_IMG}
                            onChange={(file) => updateField('CPP_COMPANY_LOGO_IMG', file)}
                            optional
                        />

                        <div className="mt-6 mb-2">
                            <h4 className="text-sm font-medium text-white mb-4">Company Address</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Street Name"
                                placeholder="e.g., Oxford Street"
                                value={formData.CPP_COMPANY_ADDRESS_LINE1}
                                onChange={(e) => updateField('CPP_COMPANY_ADDRESS_LINE1', e.target.value)}
                            />
                            <FormInput
                                label="Building Number"
                                placeholder="e.g., 123"
                                value={formData.CPP_COMPANY_A_BN}
                                onChange={(e) => updateField('CPP_COMPANY_A_BN', e.target.value)}
                            />
                            <FormInput
                                label="Neighborhood / Area"
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
                                label="Phone (UK)"
                                type="tel"
                                placeholder="+44(0)20 7123 4567"
                                value={formData.CPP_COMPANY_PHONE}
                                onChange={(e) => handlePhoneChange('CPP_COMPANY_PHONE', e.target.value)}
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
                </div>

                {/* SECTION: Project Details */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Project Details</h3>
                            <p className="text-sm text-muted-foreground">Information about this specific project</p>
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
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
                                label="F10 Notification Ref (optional)"
                                placeholder="Enter F10 reference if applicable"
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

                        <div className="mt-8 pt-6 border-t border-border">
                            <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Site Address
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">Location where the project work will be performed</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Street Name"
                                placeholder="e.g., Baker Street"
                                value={formData.CPP_SITE_ADDRESS_LINE1}
                                onChange={(e) => updateField('CPP_SITE_ADDRESS_LINE1', e.target.value)}
                                required
                                error={errors.CPP_SITE_ADDRESS_LINE1}
                            />
                            <FormInput
                                label="Building Number"
                                placeholder="e.g., 221B"
                                value={formData.CPP_SITE_A_BN}
                                onChange={(e) => updateField('CPP_SITE_A_BN', e.target.value)}
                            />
                            <FormInput
                                label="Neighborhood / Area"
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
                                required
                                error={errors.CPP_SITE_POSTCODE}
                            />
                            <FormInput
                                label="Country"
                                placeholder="Country"
                                value={formData.CPP_SITE_COUNTRY}
                                onChange={(e) => updateField('CPP_SITE_COUNTRY', e.target.value)}
                            />
                        </div>
                    </FormSection>
                </div>

                {/* AI INPUT SECTION - This drives the AI-generated content */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                AI-Powered Content
                                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#FABE2C]/20 text-[#FABE2C]">AI</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">Describe your project — AI will generate the technical safety content</p>
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
                        <FormTextarea
                            label="Description"
                            placeholder="e.g., 10-Storey Commercial Building with Cat A + Cat B interfaces. Include any key constraints or hazards..."
                            value={formData.CPP_TASK_ACTIVITY}
                            onChange={(e) => updateField('CPP_TASK_ACTIVITY', e.target.value)}
                            required
                            error={errors.CPP_TASK_ACTIVITY}
                            className="min-h-[120px]"
                        />

                        {/* Smart Work Type Toggles */}
                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-white">Work Type Indicators</h4>
                                <p className="text-xs text-muted-foreground mt-1">Select all that apply — this helps tailor the safety content</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.TOGGLE_EXTERNAL_GROUNDWORKS}
                                        onChange={(e) => updateField('TOGGLE_EXTERNAL_GROUNDWORKS', e.target.checked)}
                                        className="w-4 h-4 accent-[#FABE2C] rounded-full"
                                    />
                                    <div>
                                        <span className="text-sm text-white font-medium">External Site / Groundworks</span>
                                        <p className="text-xs text-muted-foreground">Requires hoarding, laydown areas, cranes</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.TOGGLE_HEIGHT_STRUCTURAL}
                                        onChange={(e) => updateField('TOGGLE_HEIGHT_STRUCTURAL', e.target.checked)}
                                        className="w-4 h-4 accent-[#FABE2C] rounded-full"
                                    />
                                    <div>
                                        <span className="text-sm text-white font-medium">Structural / Height Work</span>
                                        <p className="text-xs text-muted-foreground">Scaffolding, MEWPs, roof or facade access</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.TOGGLE_PUBLIC_ROAD_IMPACT}
                                        onChange={(e) => updateField('TOGGLE_PUBLIC_ROAD_IMPACT', e.target.checked)}
                                        className="w-4 h-4 accent-[#FABE2C] rounded-full"
                                    />
                                    <div>
                                        <span className="text-sm text-white font-medium">Public Road / Footway Impact</span>
                                        <p className="text-xs text-muted-foreground">Traffic closures, delivery restrictions</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.TOGGLE_MEP_COMMISSIONING}
                                        onChange={(e) => updateField('TOGGLE_MEP_COMMISSIONING', e.target.checked)}
                                        className="w-4 h-4 accent-[#FABE2C] rounded-full"
                                    />
                                    <div>
                                        <span className="text-sm text-white font-medium">M&E / Commissioning</span>
                                        <p className="text-xs text-muted-foreground">HVAC, electrical, fire systems, BMS</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </FormSection>
                </div>

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
                {
                    showWarning && (
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
                    )
                }

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

                    {/* Validation Error Message */}
                    {showValidationError && Object.keys(errors).length > 0 && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-300">Please complete all required fields</p>
                                <p className="text-xs text-red-300/70 mt-1">
                                    {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} need{Object.keys(errors).length === 1 ? 's' : ''} attention
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </form >
        </FormCard >
    );
}
