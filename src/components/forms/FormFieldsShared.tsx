'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FormSection – A styled section wrapper with heading
// ─────────────────────────────────────────────────────────────────────────────
export function FormSection({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                {description && (
                    <p className="text-sm text-white/60">{description}</p>
                )}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Permit options for both forms
// ─────────────────────────────────────────────────────────────────────────────
export const PERMIT_OPTIONS = [
    { id: 'break-ground', label: 'Permit to Break Ground / Dig' },
    { id: 'hot-works', label: 'Hot Works' },
    { id: 'confined-space', label: 'Confined Space' },
    { id: 'lift', label: 'Permit to Lift' },
    { id: 'work-at-height', label: 'Work at Height Permit' },
    { id: 'pump-discharge', label: 'Permit to Pump / Discharge' },
    { id: 'load-unload', label: 'Permit to Load / Unload' },
    { id: 'isolate', label: 'Permit to Isolate' },
] as const;

export type PermitId = (typeof PERMIT_OPTIONS)[number]['id'];

export function PermitsCheckboxGroup({
    value = [],
    onChange,
}: {
    value?: PermitId[];
    onChange: (value: PermitId[]) => void;
}) {
    const toggle = (id: PermitId) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <FormSection title="Permits Required" description="Select all that apply">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERMIT_OPTIONS.map((opt) => (
                    <label
                        key={opt.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[.03] hover:bg-white/[.06] cursor-pointer transition-colors"
                    >
                        <Checkbox
                            checked={value.includes(opt.id)}
                            onCheckedChange={() => toggle(opt.id)}
                            className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-white/90">{opt.label}</span>
                    </label>
                ))}
            </div>
        </FormSection>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PPE Options (CPP only)
// ─────────────────────────────────────────────────────────────────────────────
export const PPE_OPTIONS = [
    { id: 'hard-hat', label: 'Hard Hat' },
    { id: 'hi-vis', label: 'Hi Vis' },
    { id: 'safety-boots', label: 'Safety Boots' },
    { id: 'safety-glasses', label: 'Safety Glasses' },
    { id: 'gloves', label: 'Gloves' },
    { id: 'other-ppe', label: 'Other PPE' },
] as const;

export type PPEId = (typeof PPE_OPTIONS)[number]['id'];

export function PPECheckboxGroup({
    value = [],
    onChange,
}: {
    value?: PPEId[];
    onChange: (value: PPEId[]) => void;
}) {
    const toggle = (id: PPEId) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <FormSection title="Personal Protective Equipment" description="Select all required PPE">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PPE_OPTIONS.map((opt) => (
                    <label
                        key={opt.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[.03] hover:bg-white/[.06] cursor-pointer transition-colors"
                    >
                        <Checkbox
                            checked={value.includes(opt.id)}
                            onCheckedChange={() => toggle(opt.id)}
                            className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-white/90">{opt.label}</span>
                    </label>
                ))}
            </div>
        </FormSection>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileUploadField – Styled file input with preview
// ─────────────────────────────────────────────────────────────────────────────
export function FileUploadField({
    label,
    description,
    accept = 'image/*',
    value,
    onChange,
    optional = false,
}: {
    label: string;
    description?: string;
    accept?: string;
    value?: File | null;
    onChange: (file: File | null) => void;
    optional?: boolean;
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (value && value.type.startsWith('image/')) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onChange(file);
    };

    const handleClear = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const isImage = value?.type.startsWith('image/');

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-white/90">
                    {label}
                    {optional && <span className="text-white/40 ml-1">(optional)</span>}
                </Label>
            </div>
            {description && (
                <p className="text-xs text-white/50">{description}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {!value ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-white/20 bg-white/[.02] hover:bg-white/[.05] hover:border-white/30 transition-colors cursor-pointer"
                >
                    <Upload className="w-8 h-8 text-white/40" />
                    <span className="text-sm text-white/60">Click to upload</span>
                    <span className="text-xs text-white/40">
                        {accept === 'image/*' ? 'PNG, JPG, GIF up to 10MB' : 'Any file up to 10MB'}
                    </span>
                </button>
            ) : (
                <div className="relative flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[.03]">
                    {preview && isImage ? (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white/60" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate">{value.name}</p>
                        <p className="text-xs text-white/50">
                            {(value.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormCard – Wrapper for form with consistent styling
// ─────────────────────────────────────────────────────────────────────────────
export function FormCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]',
                className
            )}
        >
            <div className="p-4 sm:p-6 md:p-8">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormInput – Styled text input matching dark theme
// ─────────────────────────────────────────────────────────────────────────────
export function FormInput({
    label,
    description,
    required = false,
    error,
    ...props
}: React.ComponentProps<typeof Input> & {
    label: string;
    description?: string;
    required?: boolean;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-white/90">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {description && (
                <p className="text-xs text-white/50">{description}</p>
            )}
            <Input
                {...props}
                className={cn(
                    'bg-white/[.05] border-white/10 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    props.className
                )}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormTextarea – Styled textarea matching dark theme
// ─────────────────────────────────────────────────────────────────────────────
import { Textarea } from '@/components/ui/textarea';

export function FormTextarea({
    label,
    description,
    required = false,
    error,
    ...props
}: React.ComponentProps<typeof Textarea> & {
    label: string;
    description?: string;
    required?: boolean;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-white/90">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {description && (
                <p className="text-xs text-white/50">{description}</p>
            )}
            <Textarea
                {...props}
                className={cn(
                    'bg-white/[.05] border-white/10 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary min-h-[100px]',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    props.className
                )}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
