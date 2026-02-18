'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from './button'

/** خصائص مكون النافذة المنبثقة */
interface ModalProps {
    /** هل النافذة مفتوحة */
    isOpen: boolean
    /** دالة الإغلاق */
    onClose: () => void
    /** عنوان النافذة */
    title: string
    /** المحتوى */
    children: React.ReactNode
    /** حجم النافذة */
    size?: 'sm' | 'md' | 'lg'
}

/**
 * مكون النافذة المنبثقة - يُستخدم لعرض محتوى فوق الصفحة
 * مثل تأكيد الطلب أو تعديل عنصر قائمة
 */
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    // إغلاق بمفتاح Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
        >
            <div
                className={`${sizes[size]} w-full bg-white rounded-xl shadow-2xl transform transition-all`}
            >
                {/* رأس النافذة */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                {/* محتوى النافذة */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    )
}
