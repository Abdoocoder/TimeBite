'use client'

import React from 'react'
import { OrderStatus } from '@/types'

/** خصائص مكون الشارة */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** لون الشارة */
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    /** حجم الشارة */
    size?: 'sm' | 'md'
}

/**
 * مكون الشارة - يُستخدم لعرض الحالات والتصنيفات
 * مثل حالة الطلب ونسبة الدقة
 */
export const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}: BadgeProps) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full'

    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    }

    return (
        <span
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    )
}

/** ربط حالة الطلب بنوع الشارة والنص العربي */
const ORDER_STATUS_MAP: Record<OrderStatus, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'warning', label: 'قيد الانتظار' },
    preparing: { variant: 'info', label: 'قيد التحضير' },
    on_way: { variant: 'info', label: 'في الطريق' },
    delivered: { variant: 'success', label: 'تم التوصيل' },
    cancelled: { variant: 'danger', label: 'ملغي' },
}

/** شارة حالة الطلب - تعرض حالة الطلب بالألوان المناسبة */
export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
    const config = ORDER_STATUS_MAP[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
}

/** شارة نسبة الدقة - تعرض نسبة التزام المطعم بالوقت */
export const AccuracyBadge = ({ accuracy }: { accuracy: number }) => {
    const variant = accuracy >= 90 ? 'success' : accuracy >= 70 ? 'warning' : 'danger'
    return (
        <Badge variant={variant} size="sm">
            ⏰ {accuracy}% دقة
        </Badge>
    )
}
