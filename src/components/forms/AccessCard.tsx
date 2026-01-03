'use client';

import * as React from 'react';
import { Eye, EyeOff, Copy, Check, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type AccessCardProps = {
    code: string;
    email: string;
    expiresAt: string;
};

type Status = 'active' | 'expires-soon' | 'expired';

function getStatus(expiresAt: string, now: number): { status: Status; daysLeft: number } {
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
        return { status: 'expired', daysLeft: 0 };
    } else if (daysLeft <= 7) {
        return { status: 'expires-soon', daysLeft };
    } else {
        return { status: 'active', daysLeft };
    }
}

function formatExpiryDate(expiresAt: string): string {
    try {
        const date = new Date(expiresAt);
        // Use fixed format to avoid hydration mismatch
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
        return 'Unknown';
    }
}

function maskCode(code: string): string {
    if (code.length <= 4) return code;
    const visible = code.slice(-4);
    const masked = '••••';
    return `${masked} ${visible}`;
}

export function AccessCard({ code, email, expiresAt }: AccessCardProps) {
    const [showCode, setShowCode] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    // Only compute time-dependent values on client to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Use a stable initial value for SSR, then update on client
    const now = mounted ? Date.now() : new Date(expiresAt).getTime() + 1000; // Assume active during SSR
    const { status, daysLeft } = getStatus(expiresAt, now);
    const formattedExpiry = formatExpiryDate(expiresAt);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const statusConfig = {
        active: {
            icon: CheckCircle,
            label: 'Active',
            className: 'bg-green-500/20 text-green-400 border-green-500/30',
        },
        'expires-soon': {
            icon: AlertTriangle,
            label: 'Expires Soon',
            className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        expired: {
            icon: Clock,
            label: 'Expired',
            className: 'bg-red-500/20 text-red-400 border-red-500/30',
        },
    };

    const { icon: StatusIcon, label: statusLabel, className: statusClassName } = statusConfig[status];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 space-y-4">
            {/* Row 1: Status + Expiry */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                        statusClassName
                    )}
                >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusLabel}
                </span>
                <div className="text-sm text-white/70">
                    <span className="text-white/50">Expires: </span>
                    <span className="font-medium text-white/90">{formattedExpiry}</span>
                    {mounted && status === 'expires-soon' && daysLeft > 0 && (
                        <span className="ml-2 text-amber-400 text-xs">
                            ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                        </span>
                    )}
                </div>
            </div>

            {/* Row 2: Code + Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Code display */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/50 text-sm">Code:</span>
                    <code className="font-mono text-white tracking-widest text-sm">
                        {showCode ? code : maskCode(code)}
                    </code>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCode(!showCode)}
                        className="flex-1 sm:flex-none gap-1.5 border-white/10 hover:bg-white/10"
                    >
                        {showCode ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                <span className="sm:hidden">Hide</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                <span className="sm:hidden">Show</span>
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className={cn(
                            'flex-1 sm:flex-none gap-1.5 border-white/10',
                            copied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10'
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="sm:hidden">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span className="sm:hidden">Copy</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Email (subtle) */}
            <p className="text-xs text-white/40 truncate">
                Account: {email}
            </p>
        </div>
    );
}
