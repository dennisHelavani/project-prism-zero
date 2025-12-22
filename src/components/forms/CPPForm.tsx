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
    PPECheckboxGroup,
    type PermitId,
    type PPEId,
} from './FormFieldsShared';

type CPPFormData = {
    // Header/Approval
    email: string;
    approvedByName: string;
    writtenBy: string;
    revision: string;

    // Project Details
    projectName: string;
    projectNumber: string;
    clientName: string;
    principalDesigner: string;
    principalContractor: string;
    f10Ref: string;
    siteAddress: string;
    dateStart: string;
    duration: string;
    projectTask: string;
    deliveriesNote: string;

    // Permits & PPE
    permits: PermitId[];
    ppe: PPEId[];

    // Emergency Contacts
    projectManager: string;
    siteManager: string;
    supervisor: string;
    firstAiders: string;
    fireMarshalls: string;
    otherRoles: string;

    // Files
    companyLogo: File | null;
    deliveriesImage: File | null;
};

const initialFormData: CPPFormData = {
    email: '',
    approvedByName: '',
    writtenBy: '',
    revision: '',
    projectName: '',
    projectNumber: '',
    clientName: '',
    principalDesigner: '',
    principalContractor: '',
    f10Ref: '',
    siteAddress: '',
    dateStart: '',
    duration: '',
    projectTask: '',
    deliveriesNote: '',
    permits: [],
    ppe: [],
    projectManager: '',
    siteManager: '',
    supervisor: '',
    firstAiders: '',
    fireMarshalls: '',
    otherRoles: '',
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

    const updateField = <K extends keyof CPPFormData>(key: K, value: CPPFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CPPFormData, string>> = {};

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }
        if (!formData.dateStart) {
            newErrors.dateStart = 'Start date is required';
        }
        if (!formData.siteAddress.trim()) {
            newErrors.siteAddress = 'Site address is required';
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

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('product', 'CPP');
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
                        Your CPP are on their way!<br />
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
                    <h2 className="text-xl font-bold text-white">Construction Phase Plan Generator</h2>
                    <p className="text-sm text-white/60">
                        Fill in the project details below. An AI will generate your Construction Phase Plan.
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

                {/* Approval Info */}
                <FormSection title="Document Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Approved By"
                            placeholder="Name"
                            value={formData.approvedByName}
                            onChange={(e) => updateField('approvedByName', e.target.value)}
                        />
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
                    </div>
                </FormSection>

                {/* Company Logo */}
                <FormSection title="Branding">
                    <FileUploadField
                        label="Company Logo"
                        description="Upload your company logo (optional)"
                        accept="image/*"
                        value={formData.companyLogo}
                        onChange={(file) => updateField('companyLogo', file)}
                        optional
                    />
                </FormSection>

                {/* Project Details Section */}
                <FormSection title="Project Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project Name"
                            placeholder="e.g., 10-Storey Commercial Building"
                            value={formData.projectName}
                            onChange={(e) => updateField('projectName', e.target.value)}
                            required
                            error={errors.projectName}
                        />
                        <FormInput
                            label="Project Number"
                            placeholder="Project reference number"
                            value={formData.projectNumber}
                            onChange={(e) => updateField('projectNumber', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Client"
                            placeholder="Client name"
                            value={formData.clientName}
                            onChange={(e) => updateField('clientName', e.target.value)}
                        />
                        <FormInput
                            label="Principal Designer"
                            placeholder="Name"
                            value={formData.principalDesigner}
                            onChange={(e) => updateField('principalDesigner', e.target.value)}
                        />
                        <FormInput
                            label="Principal Contractor"
                            placeholder="Name"
                            value={formData.principalContractor}
                            onChange={(e) => updateField('principalContractor', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="F10 Notification Ref"
                            placeholder="If applicable"
                            value={formData.f10Ref}
                            onChange={(e) => updateField('f10Ref', e.target.value)}
                        />
                        <FormInput
                            label="Site Address"
                            placeholder="Full site address"
                            value={formData.siteAddress}
                            onChange={(e) => updateField('siteAddress', e.target.value)}
                            required
                            error={errors.siteAddress}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Planned Start Date"
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
                </FormSection>

                {/* Project Task / Activity */}
                <FormSection
                    title="Project Task / Activity"
                    description="Describe the main activities for the Construction Phase Plan"
                >
                    <FormTextarea
                        label="Description"
                        placeholder="e.g., 10-Storey Commercial Building with Cat A + Cat B interfaces..."
                        value={formData.projectTask}
                        onChange={(e) => updateField('projectTask', e.target.value)}
                        required
                        error={errors.projectTask}
                        className="min-h-[100px]"
                    />
                </FormSection>

                {/* Deliveries / TMP */}
                <FormSection title="Deliveries / Traffic Management">
                    <FileUploadField
                        label="Traffic Management Plan Image"
                        description="Upload an image, or describe below"
                        accept="image/*"
                        value={formData.deliveriesImage}
                        onChange={(file) => updateField('deliveriesImage', file)}
                        optional
                    />
                    <FormInput
                        label="Or describe traffic management"
                        placeholder="Not applicable for this project"
                        value={formData.deliveriesNote}
                        onChange={(e) => updateField('deliveriesNote', e.target.value)}
                    />
                </FormSection>

                {/* Permits */}
                <PermitsCheckboxGroup
                    value={formData.permits}
                    onChange={(v) => updateField('permits', v)}
                />

                {/* PPE */}
                <PPECheckboxGroup
                    value={formData.ppe}
                    onChange={(v) => updateField('ppe', v)}
                />

                {/* Emergency Contacts */}
                <FormSection title="Emergency Contacts">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project Manager"
                            placeholder="Name"
                            value={formData.projectManager}
                            onChange={(e) => updateField('projectManager', e.target.value)}
                        />
                        <FormInput
                            label="Site Manager"
                            placeholder="Name"
                            value={formData.siteManager}
                            onChange={(e) => updateField('siteManager', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Supervisor"
                            placeholder="Name"
                            value={formData.supervisor}
                            onChange={(e) => updateField('supervisor', e.target.value)}
                        />
                        <FormInput
                            label="First Aiders"
                            placeholder="Names"
                            value={formData.firstAiders}
                            onChange={(e) => updateField('firstAiders', e.target.value)}
                        />
                        <FormInput
                            label="Fire Marshalls"
                            placeholder="Names"
                            value={formData.fireMarshalls}
                            onChange={(e) => updateField('fireMarshalls', e.target.value)}
                        />
                    </div>
                    <FormTextarea
                        label="Other Roles"
                        placeholder="Any other relevant contacts or roles"
                        value={formData.otherRoles}
                        onChange={(e) => updateField('otherRoles', e.target.value)}
                    />
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
                                Generate CPP
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormCard>
    );
}
