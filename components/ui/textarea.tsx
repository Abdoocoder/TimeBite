'use client'

import React from 'react'

/** خصائص مكون مساحة النص */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** تسمية الحقل */
    label?: string
    /** رسالة الخطأ */
    error?: string
}

/**
 * مكون مساحة النص - للحقول متعددة الأسطر
 * مثل وصف المطعم أو ملاحظات الطلب
 */
export const Textarea = ({ label, error, className = '', ...props }: TextareaProps) => {
    return (
        <div className="space-y-1">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
            <textarea
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-y min-h-[80px] ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
