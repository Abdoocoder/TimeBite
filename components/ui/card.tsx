'use client'

import React from 'react'

/** خصائص مكون البطاقة */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** نوع البطاقة */
    variant?: 'default' | 'elevated' | 'outlined'
    /** إضافة تأثير عند التمرير */
    hoverable?: boolean
}

/**
 * مكون البطاقة - يُستخدم لعرض المحتوى في بطاقات منظمة
 * مثل بطاقات المطاعم والطلبات وعناصر القائمة
 */
export const Card = ({
    children,
    variant = 'default',
    hoverable = false,
    className = '',
    ...props
}: CardProps) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200'

    const variants = {
        default: 'bg-white shadow-md border border-gray-100',
        elevated: 'bg-white shadow-xl',
        outlined: 'bg-white border-2 border-gray-200',
    }

    const hoverStyles = hoverable
        ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        : ''

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

/** رأس البطاقة */
export const CardHeader = ({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`p-4 border-b border-gray-100 ${className}`} {...props}>
        {children}
    </div>
)

/** محتوى البطاقة */
export const CardContent = ({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`p-4 ${className}`} {...props}>
        {children}
    </div>
)

/** تذييل البطاقة */
export const CardFooter = ({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`p-4 border-t border-gray-100 bg-gray-50 ${className}`} {...props}>
        {children}
    </div>
)
