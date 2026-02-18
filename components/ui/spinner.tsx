'use client'

import React from 'react'

/** خصائص مكون التحميل */
interface SpinnerProps {
    /** حجم المؤشر */
    size?: 'sm' | 'md' | 'lg'
    /** نص التحميل (اختياري) */
    label?: string
}

/**
 * مكون مؤشر التحميل - يُعرض أثناء جلب البيانات
 */
export const Spinner = ({ size = 'md', label }: SpinnerProps) => {
    const sizes = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <svg
                className={`animate-spin text-primary-600 ${sizes[size]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            {label && <p className="text-sm text-gray-500">{label}</p>}
        </div>
    )
}

/**
 * مكون صفحة التحميل الكاملة - يُعرض كصفحة كاملة أثناء التحميل
 */
export const PageSpinner = ({ label = 'جاري التحميل...' }: { label?: string }) => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" label={label} />
    </div>
)
