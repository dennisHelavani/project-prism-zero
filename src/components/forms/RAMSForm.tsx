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
// Permit options
const PERMITS = [
    { id: 'break-ground', label: 'Permit to Break Ground / Dig' },
    { id: 'hot-works', label: 'Hot works' },
    { id: 'confined-space', label: 'Confined Space' },
    { id: 'lift', label: 'Permit to Lift' },
    { id: 'work-at-height', label: 'Work at Height Permit' },
    { id: 'pump-discharge', label: 'Permit to Pump / Discharge' },
    { id: 'load-unload', label: 'Permit to Load / Unload' },
    { id: 'isolate', label: 'Permit to Isolate' },
] as const;

type PermitId = (typeof PERMITS)[number]['id'];

// Form data keys match template placeholder names exactly
type RAMSFormData = {
    // Customer
    email: string;

    // Company Details (Expanded Address)
    RAMS_COMPANY_NAME: string;
    RAMS_COMPANY_ADDRESS_LINE1: string; // Street Name
    RAMS_COMPANY_A_BN: string; // Building Number
    RAMS_COMPANY_ADDRESS_LINE2: string; // Neighborhood/Area
    RAMS_COMPANY_CITY: string;
    RAMS_COMPANY_POSTCODE: string;
    RAMS_COMPANY_COUNTRY: string;
    RAMS_COMPANY_PHONE: string;
    RAMS_COMPANY_EMAIL: string;

    // Project Basics
    RAMS_TITLE: string;
    RAMS_START_DATE: string;
    RAMS_DURATION: string;

    // Deliveries
    RAMS_DELIVERIES_TEXT: string;

    // Fire Plan
    RAMS_FIRE_PLAN_TEXT: string;

    // Location of Work
    RAMS_LOCATION_OF_WORK: string;

    // Emergency Contacts
    RAMS_FIRST_AIDERS: string;
    RAMS_FIRE_MARSHALLS: string;

    // Permits
    permits: PermitId[];

    // AI Input (for generation)
    aiTaskDescription: string;

    // Files (optional)
    RAMS_COMPANY_LOGO_IMG: File | null;
    RAMS_CLIENT_LOGO_IMG: File | null;
    RAMS_DELIVERIES_IMG: File | null;
    RAMS_FIRE_PLAN_IMG: File | null;
    RAMS_NEAREST_HOSPITAL_IMG: File | null;
};

const initialFormData: RAMSFormData = {
    email: '',
    RAMS_COMPANY_NAME: '',
    RAMS_COMPANY_ADDRESS_LINE1: '',
    RAMS_COMPANY_A_BN: '',
    RAMS_COMPANY_ADDRESS_LINE2: '',
    RAMS_COMPANY_CITY: '',
    RAMS_COMPANY_POSTCODE: '',
    RAMS_COMPANY_COUNTRY: '',
    RAMS_COMPANY_PHONE: '',
    RAMS_COMPANY_EMAIL: '',
    RAMS_TITLE: '',
    RAMS_START_DATE: '',
    RAMS_DURATION: '',
    RAMS_DELIVERIES_TEXT: '',
    RAMS_FIRE_PLAN_TEXT: '',
    RAMS_LOCATION_OF_WORK: '',
    RAMS_FIRST_AIDERS: '',
    RAMS_FIRE_MARSHALLS: '',
    permits: [],
    aiTaskDescription: '',
    RAMS_COMPANY_LOGO_IMG: null,
    RAMS_CLIENT_LOGO_IMG: null,
    RAMS_DELIVERIES_IMG: null,
    RAMS_FIRE_PLAN_IMG: null,
    RAMS_NEAREST_HOSPITAL_IMG: null,
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
    const [showValidationError, setShowValidationError] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [isLoadingDefaults, setIsLoadingDefaults] = React.useState(false);
    const [useClientCPP, setUseClientCPP] = React.useState(false); // Toggle for "As per Client CPP" (Deliveries)
    const [useClientFirePlan, setUseClientFirePlan] = React.useState(false); // Toggle for "Use Client Fire Plan"

    // Load RAMS-specific profile defaults on mount
    React.useEffect(() => {
        if (!email) return;

        const loadDefaults = async () => {
            setIsLoadingDefaults(true);
            try {
                // Try to load generic defaults if RAMS specific ones aren't fully populated? 
                // Currently just loading RAMS defaults as per pattern.
                // We might want to unify company defaults across products later.
                const res = await fetch(`/api/profile/defaults?email=${encodeURIComponent(email)}&product=RAMS`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaults) {
                        setFormData((prev) => ({
                            ...prev,
                            RAMS_COMPANY_NAME: data.defaults.RAMS_COMPANY_NAME || prev.RAMS_COMPANY_NAME,
                            RAMS_COMPANY_PHONE: data.defaults.RAMS_COMPANY_PHONE || prev.RAMS_COMPANY_PHONE,
                            RAMS_COMPANY_EMAIL: data.defaults.RAMS_COMPANY_EMAIL || prev.RAMS_COMPANY_EMAIL,
                            // Load address defaults if available
                            RAMS_COMPANY_ADDRESS_LINE1: data.defaults.RAMS_COMPANY_ADDRESS_LINE1 || prev.RAMS_COMPANY_ADDRESS_LINE1,
                            RAMS_COMPANY_A_BN: data.defaults.RAMS_COMPANY_A_BN || prev.RAMS_COMPANY_A_BN,
                            RAMS_COMPANY_ADDRESS_LINE2: data.defaults.RAMS_COMPANY_ADDRESS_LINE2 || prev.RAMS_COMPANY_ADDRESS_LINE2,
                            RAMS_COMPANY_CITY: data.defaults.RAMS_COMPANY_CITY || prev.RAMS_COMPANY_CITY,
                            RAMS_COMPANY_POSTCODE: data.defaults.RAMS_COMPANY_POSTCODE || prev.RAMS_COMPANY_POSTCODE,
                            RAMS_COMPANY_COUNTRY: data.defaults.RAMS_COMPANY_COUNTRY || prev.RAMS_COMPANY_COUNTRY,
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

    const handlePhoneChange = (key: 'RAMS_COMPANY_PHONE', value: string) => {
        const formatted = formatUKPhone(value);
        updateField(key, formatted);
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

        if (!formData.RAMS_COMPANY_NAME.trim()) {
            newErrors.RAMS_COMPANY_NAME = 'Company name is required';
        }
        if (!formData.RAMS_TITLE.trim()) {
            newErrors.RAMS_TITLE = 'RAMS title is required';
        }
        if (!formData.RAMS_START_DATE) {
            newErrors.RAMS_START_DATE = 'Start date is required';
        }
        if (!formData.RAMS_DURATION.trim()) {
            newErrors.RAMS_DURATION = 'Duration is required';
        }

        // Address validation
        if (!formData.RAMS_COMPANY_ADDRESS_LINE1.trim()) {
            newErrors.RAMS_COMPANY_ADDRESS_LINE1 = 'Street name / Line 1 is required';
        }
        if (!formData.RAMS_COMPANY_CITY.trim()) {
            newErrors.RAMS_COMPANY_CITY = 'City is required';
        }

        if (!formData.aiTaskDescription.trim()) {
            newErrors.aiTaskDescription = 'Works description is required for AI generation';
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

        try {
            // Calculate timestamps
            const now = new Date();
            const dateStamped = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const dateTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM

            // Build placeholders object with exact keys
            const placeholders: Record<string, string> = {
                RAMS_DATE_STAMPED: dateStamped,
                RAMS_DATE_TIME: dateTime,
                RAMS_TITLE: formData.RAMS_TITLE,
                RAMS_COMPANY_NAME: formData.RAMS_COMPANY_NAME,

                // Company Address placeholders
                RAMS_COMPANY_ADDRESS_LINE1: formData.RAMS_COMPANY_ADDRESS_LINE1,
                RAMS_COMPANY_A_BN: formData.RAMS_COMPANY_A_BN,
                RAMS_COMPANY_ADDRESS_LINE2: formData.RAMS_COMPANY_ADDRESS_LINE2,
                RAMS_COMPANY_CITY: formData.RAMS_COMPANY_CITY,
                RAMS_COMPANY_POSTCODE: formData.RAMS_COMPANY_POSTCODE,
                RAMS_COMPANY_COUNTRY: formData.RAMS_COMPANY_COUNTRY,

                // MAP TO SITE PLACEHOLDERS (Safety fallback in case template uses SITE keys)
                RAMS_SITE_A_BN: formData.RAMS_COMPANY_A_BN,
                CPP_COMPANY_A_BN: formData.RAMS_COMPANY_A_BN, // User indicated mixed keys might be present
                RAMS_SITE_ADDRESS_LINE1: formData.RAMS_COMPANY_ADDRESS_LINE1,
                CPP_COMPANY_ADDRESS_LINE1: formData.RAMS_COMPANY_ADDRESS_LINE1, // Alias

                RAMS_SITE_ADDRESS_LINE2: formData.RAMS_COMPANY_ADDRESS_LINE2,
                CPP_COMPANY_ADDRESS_LINE2: formData.RAMS_COMPANY_ADDRESS_LINE2, // Alias for Neighborhood

                RAMS_SITE_CITY: formData.RAMS_COMPANY_CITY,
                CPP_COMPANY_CITY: formData.RAMS_COMPANY_CITY, // Alias

                RAMS_SITE_POSTCODE: formData.RAMS_COMPANY_POSTCODE,
                CPP_COMPANY_POSTCODE: formData.RAMS_COMPANY_POSTCODE, // Alias

                RAMS_SITE_COUNTRY: formData.RAMS_COMPANY_COUNTRY,
                CPP_COMPANY_COUNTRY: formData.RAMS_COMPANY_COUNTRY, // Alias

                RAMS_COMPANY_PHONE: formData.RAMS_COMPANY_PHONE,
                RAMS_COMPANY_EMAIL: formData.RAMS_COMPANY_EMAIL,
                RAMS_START_DATE: formData.RAMS_START_DATE,
                RAMS_DURATION: formData.RAMS_DURATION,

                // Granular Permits
                RAMS_PERMIT_BREAK_GROUND: formData.permits.includes('break-ground') ? 'Permit to Break Ground / Dig' : '',
                RAMS_PERMIT_HOT_WORKS: formData.permits.includes('hot-works') ? 'Hot works' : '',
                RAMS_PERMIT_CONFINED_SPACE: formData.permits.includes('confined-space') ? 'Confined Space' : '',
                RAMS_PERMIT_LIFT: formData.permits.includes('lift') ? 'Permit to Lift' : '',
                RAMS_PERMIT_WORK_AT_HEIGHT: formData.permits.includes('work-at-height') ? 'Work at Height Permit' : '',
                RAMS_PERMIT_PUMP_DISCHARGE: formData.permits.includes('pump-discharge') ? 'Permit to Pump / Discharge' : '',
                RAMS_PERMIT_LOAD_UNLOAD: formData.permits.includes('load-unload') ? 'Permit to Load / Unload' : '',
                RAMS_PERMIT_ISOLATE: formData.permits.includes('isolate') ? 'Permit to Isolate' : '',

                RAMS_FIRST_AIDERS: formData.RAMS_FIRST_AIDERS,
                RAMS_FIRE_MARSHALLS: formData.RAMS_FIRE_MARSHALLS,
                RAMS_DELIVERIES_TEXT: formData.RAMS_DELIVERIES_TEXT,
                RAMS_FIRE_PLAN_TEXT: formData.RAMS_FIRE_PLAN_TEXT,
                RAMS_LOCATION_OF_WORK: formData.RAMS_LOCATION_OF_WORK,
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
            if (formData.RAMS_CLIENT_LOGO_IMG) {
                formDataToSend.append('RAMS_CLIENT_LOGO_IMG', formData.RAMS_CLIENT_LOGO_IMG);
            }
            if (formData.RAMS_DELIVERIES_IMG) {
                formDataToSend.append('RAMS_DELIVERIES_IMG', formData.RAMS_DELIVERIES_IMG);
            }
            if (formData.RAMS_FIRE_PLAN_IMG) {
                formDataToSend.append('RAMS_FIRE_PLAN_IMG', formData.RAMS_FIRE_PLAN_IMG);
            }
            if (formData.RAMS_NEAREST_HOSPITAL_IMG) {
                formDataToSend.append('RAMS_NEAREST_HOSPITAL_IMG', formData.RAMS_NEAREST_HOSPITAL_IMG);
            }

            // Use the access/submit endpoint which triggers doc generation
            const res = await fetch('/api/access/submit', {
                method: 'POST',
                body: formDataToSend,
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
                            // Save address defaults
                            RAMS_COMPANY_ADDRESS_LINE1: formData.RAMS_COMPANY_ADDRESS_LINE1,
                            RAMS_COMPANY_A_BN: formData.RAMS_COMPANY_A_BN,
                            RAMS_COMPANY_ADDRESS_LINE2: formData.RAMS_COMPANY_ADDRESS_LINE2,
                            RAMS_COMPANY_CITY: formData.RAMS_COMPANY_CITY,
                            RAMS_COMPANY_POSTCODE: formData.RAMS_COMPANY_POSTCODE,
                            RAMS_COMPANY_COUNTRY: formData.RAMS_COMPANY_COUNTRY,
                            permits: formData.permits,
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
                            value={formData.RAMS_COMPANY_NAME}
                            onChange={(e) => updateField('RAMS_COMPANY_NAME', e.target.value)}
                            error={errors.RAMS_COMPANY_NAME}
                            required
                        />
                        <FileUploadField
                            label="Company Logo (optional)"
                            description="PNG or JPG, max 5MB"
                            accept="image/png,image/jpeg"
                            value={formData.RAMS_COMPANY_LOGO_IMG}
                            onChange={(file) => updateField('RAMS_COMPANY_LOGO_IMG', file)}
                            optional
                        />
                        <FileUploadField
                            label="Client Logo (optional)"
                            description="PNG or JPG, max 5MB"
                            accept="image/png,image/jpeg"
                            value={formData.RAMS_CLIENT_LOGO_IMG}
                            onChange={(file) => updateField('RAMS_CLIENT_LOGO_IMG', file)}
                            optional
                        />

                        <div className="mt-6 mb-2">
                            <h4 className="text-sm font-medium text-white mb-4">Company Address</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Street Name"
                                placeholder="e.g., Oxford Street"
                                value={formData.RAMS_COMPANY_ADDRESS_LINE1}
                                onChange={(e) => updateField('RAMS_COMPANY_ADDRESS_LINE1', e.target.value)}
                                error={errors.RAMS_COMPANY_ADDRESS_LINE1}
                                required
                            />
                            <FormInput
                                label="Building Number"
                                placeholder="e.g., 123"
                                value={formData.RAMS_COMPANY_A_BN}
                                onChange={(e) => updateField('RAMS_COMPANY_A_BN', e.target.value)}
                            />
                            <FormInput
                                label="Neighborhood / Area"
                                placeholder="Optional"
                                value={formData.RAMS_COMPANY_ADDRESS_LINE2}
                                onChange={(e) => updateField('RAMS_COMPANY_ADDRESS_LINE2', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput
                                label="City"
                                placeholder="City"
                                value={formData.RAMS_COMPANY_CITY}
                                onChange={(e) => updateField('RAMS_COMPANY_CITY', e.target.value)}
                                error={errors.RAMS_COMPANY_CITY}
                                required
                            />
                            <FormInput
                                label="Postcode"
                                placeholder="Postcode"
                                value={formData.RAMS_COMPANY_POSTCODE}
                                onChange={(e) => updateField('RAMS_COMPANY_POSTCODE', e.target.value)}
                            />
                            <FormInput
                                label="Country"
                                placeholder="Country"
                                value={formData.RAMS_COMPANY_COUNTRY}
                                onChange={(e) => updateField('RAMS_COMPANY_COUNTRY', e.target.value)}
                            />
                            <FormInput
                                label="Phone (UK)"
                                type="tel"
                                placeholder="+44(0)..."
                                value={formData.RAMS_COMPANY_PHONE}
                                onChange={(e) => handlePhoneChange('RAMS_COMPANY_PHONE', e.target.value)}
                            />
                        </div>
                        <FormInput
                            label="Company Email"
                            type="email"
                            placeholder="Company email address"
                            value={formData.RAMS_COMPANY_EMAIL}
                            onChange={(e) => updateField('RAMS_COMPANY_EMAIL', e.target.value)}
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
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
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
                </div>

                {/* SECTION: Deliveries & Site Access */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Deliveries & Work Location</h3>
                            <p className="text-sm text-muted-foreground"></p>
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
                        {/* Toggle Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseClientCPP(false);
                                    // Clear the auto-filled text if switching back
                                    if (formData.RAMS_DELIVERIES_TEXT === 'As per Client CPP and Induction') {
                                        updateField('RAMS_DELIVERIES_TEXT', '');
                                    }
                                }}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${!useClientCPP
                                    ? 'border-[#FABE2C] bg-[#FABE2C]/10'
                                    : 'border-white/10 bg-white/[.02] hover:bg-white/[.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useClientCPP ? 'border-[#FABE2C]' : 'border-white/30'
                                        }`}>
                                        {!useClientCPP && <div className="w-2.5 h-2.5 rounded-full bg-[#FABE2C]" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Upload Custom TMP</p>
                                        <p className="text-xs text-white/60">Provide your own traffic management plan</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setUseClientCPP(true);
                                    // Auto-fill the text and clear any uploaded image
                                    updateField('RAMS_DELIVERIES_TEXT', 'As per Client CPP and Induction');
                                    updateField('RAMS_DELIVERIES_IMG', null);
                                }}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${useClientCPP
                                    ? 'border-[#FABE2C] bg-[#FABE2C]/10'
                                    : 'border-white/10 bg-white/[.02] hover:bg-white/[.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useClientCPP ? 'border-[#FABE2C]' : 'border-white/30'
                                        }`}>
                                        {useClientCPP && <div className="w-2.5 h-2.5 rounded-full bg-[#FABE2C]" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Use Client CPP & Induction</p>
                                        <p className="text-xs text-white/60">Default to client's existing arrangements</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Conditional Fields - only editable when NOT using Client CPP */}
                        <div className={`space-y-4 transition-opacity ${useClientCPP ? 'opacity-50 pointer-events-none' : ''}`}>
                            <FileUploadField
                                label="Traffic Management Plan Image"
                                description="Upload Client TMP, site layout, or delivery access plan (PNG/JPG)"
                                accept="image/png,image/jpeg"
                                value={formData.RAMS_DELIVERIES_IMG}
                                onChange={(file) => updateField('RAMS_DELIVERIES_IMG', file)}
                                optional
                            />

                            <FormTextarea
                                label="Additional Delivery Notes (Optional or Leave To Us)"
                                placeholder="Any additional delivery arrangements, access restrictions, or logistics notes..."
                                value={formData.RAMS_DELIVERIES_TEXT}
                                onChange={(e) => updateField('RAMS_DELIVERIES_TEXT', e.target.value)}
                                className="min-h-[80px]"

                            />
                        </div>

                        {/* Show confirmation when Client CPP is selected */}
                        {useClientCPP && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-200">
                                    Deliveries will defer to "As per Client CPP and Induction"
                                </p>
                            </div>
                        )}
                    </FormSection>
                </div>

                {/* Location of Work */}
                <FormSection title="Location of Work">
                    <FormInput
                        label=""
                        placeholder="Enter the street address or location of works..."
                        value={formData.RAMS_LOCATION_OF_WORK}
                        onChange={(e) => updateField('RAMS_LOCATION_OF_WORK', e.target.value)}
                    />
                </FormSection>

                {/* SECTION: Fire Plan */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Fire Plan</h3>
                            <p className="text-sm text-muted-foreground">Emergency fire procedures and evacuation plan</p>
                        </div>
                    </div>

                    <FormSection title="" className="space-y-4">
                        {/* Toggle Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseClientFirePlan(false);
                                    // Clear the auto-filled text if switching back
                                    if (formData.RAMS_FIRE_PLAN_TEXT === 'As per Client Fire Plan') {
                                        updateField('RAMS_FIRE_PLAN_TEXT', '');
                                    }
                                }}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${!useClientFirePlan
                                    ? 'border-[#FABE2C] bg-[#FABE2C]/10'
                                    : 'border-white/10 bg-white/[.02] hover:bg-white/[.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useClientFirePlan ? 'border-[#FABE2C]' : 'border-white/30'
                                        }`}>
                                        {!useClientFirePlan && <div className="w-2.5 h-2.5 rounded-full bg-[#FABE2C]" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Upload Custom Fire Plan</p>
                                        <p className="text-xs text-white/60">Provide your own fire plan and evacuation procedures</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setUseClientFirePlan(true);
                                    // Auto-fill the text and clear any uploaded image
                                    updateField('RAMS_FIRE_PLAN_TEXT', 'As per Client Fire Plan');
                                    updateField('RAMS_FIRE_PLAN_IMG', null);
                                }}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${useClientFirePlan
                                    ? 'border-[#FABE2C] bg-[#FABE2C]/10'
                                    : 'border-white/10 bg-white/[.02] hover:bg-white/[.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useClientFirePlan ? 'border-[#FABE2C]' : 'border-white/30'
                                        }`}>
                                        {useClientFirePlan && <div className="w-2.5 h-2.5 rounded-full bg-[#FABE2C]" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Use Client Fire Plan</p>
                                        <p className="text-xs text-white/60">Default to client's existing fire procedures</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Conditional Fields - only editable when NOT using Client Fire Plan */}
                        <div className={`space-y-4 transition-opacity ${useClientFirePlan ? 'opacity-50 pointer-events-none' : ''}`}>
                            <FileUploadField
                                label="Fire Plan Image"
                                description="Upload site fire plan, evacuation routes, or assembly points (PNG/JPG)"
                                accept="image/png,image/jpeg"
                                value={formData.RAMS_FIRE_PLAN_IMG}
                                onChange={(file) => updateField('RAMS_FIRE_PLAN_IMG', file)}
                                optional
                            />

                            <FormTextarea
                                label="Additional Fire Plan Notes (Optional or Leave To Us)"
                                placeholder="Any additional fire safety procedures, evacuation notes, or emergency instructions..."
                                value={formData.RAMS_FIRE_PLAN_TEXT}
                                onChange={(e) => updateField('RAMS_FIRE_PLAN_TEXT', e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        {/* Show confirmation when Client Fire Plan is selected */}
                        {useClientFirePlan && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-200">
                                    Fire Plan will defer to "Please refer to the Client's Fire Plan"
                                </p>
                            </div>
                        )}
                    </FormSection>
                </div>

                {/* SECTION: Site Safety & Permits */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Site Safety & Permits</h3>
                            <p className="text-sm text-muted-foreground">Emergency contacts and required work permits</p>
                        </div>
                    </div>

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

                    <div className="mt-6">
                        <FormSection title="Nearest Hospital Route">
                            <FileUploadField
                                label="Hospital Route Map"
                                description="Upload a map showing the driving route from site to nearest hospital"
                                accept="image/png,image/jpeg"
                                value={formData.RAMS_NEAREST_HOSPITAL_IMG}
                                onChange={(file) => updateField('RAMS_NEAREST_HOSPITAL_IMG', file)}
                                optional
                            />
                        </FormSection>
                    </div>

                    <div className="mt-8">
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
                        </FormSection>
                    </div>
                </div>

                {/* SECTION: AI Input - Works Description */}
                <div className="border-t-2 border-[#FABE2C] pt-8 mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FABE2C]/20">
                            <svg className="w-5 h-5 text-[#FABE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">AI-Powered Content</h3>
                            <p className="text-sm text-muted-foreground">Describe the works in detail - AI will generate the sequence and risk assessment</p>
                        </div>
                    </div>

                    <FormSection title="">
                        <FormTextarea
                            label="Activity Description"
                            placeholder={"Describe the activity in detail. Include:\n• Type of work (e.g., excavation, lifting operations, roof works)\n• Plant & equipment being used (e.g., excavator, crawler crane, MEWP)\n• Key constraints (e.g., live traffic, overhead cables, confined spaces)\n• Specific hazards you want addressed\n\nExample: Excavation works using 13-tonne excavator to form foundations. Work adjacent to live carriageway. Key hazards include collapse of excavation, underground services, and plant movements near public."}
                            value={formData.aiTaskDescription}
                            onChange={(e) => updateField('aiTaskDescription', e.target.value)}
                            required
                            error={errors.aiTaskDescription}
                            className="min-h-[180px]"
                        />
                    </FormSection>
                </div>

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
            </form>
        </FormCard>
    );
}
