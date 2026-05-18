import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isVerified?: boolean | null;
  className?: string;
}

export function StatusBadge({ isVerified, className }: StatusBadgeProps) {
  if (isVerified === true) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--color-verified)/0.15)] text-[hsl(var(--color-verified))]", className)} data-testid="status-verified">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>مسجل رسمياً</span>
      </div>
    );
  }
  
  if (isVerified === false) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--color-danger)/0.15)] text-[hsl(var(--color-danger))]", className)} data-testid="status-unverified">
        <XCircle className="w-3.5 h-3.5" />
        <span>غير مسجل — مشبوه</span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]", className)} data-testid="status-unknown">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>غير مؤكد</span>
    </div>
  );
}
