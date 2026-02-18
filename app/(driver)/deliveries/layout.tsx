'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * تخطيط واجهة السائق - بسيط مع التحقق من الدور
 */
export default function DriverLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()

    if (loading) return <PageSpinner />

    // التحقق من أن المستخدم سائق
    if (!user || user.role !== 'driver') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-4xl mb-4">🔒</p>
                    <p className="text-xl text-gray-500">هذه الصفحة مخصصة للسائقين فقط</p>
                    <Link href="/" className="text-primary-600 hover:underline mt-2 block">
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* شريط الحالة */}
            <div className="bg-primary-600 text-white py-3 px-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🛵</span>
                        <span className="font-medium">وضع السائق</span>
                    </div>
                    <span className="text-sm text-primary-100">{user.full_name}</span>
                </div>
            </div>
            <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </div>
    )
}
