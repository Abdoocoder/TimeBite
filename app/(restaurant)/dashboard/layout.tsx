'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { PageSpinner } from '@/components/ui/spinner'

/** عناصر القائمة الجانبية */
const SIDEBAR_ITEMS = [
    { href: '/dashboard', label: 'نظرة عامة', icon: '📊' },
    { href: '/dashboard/orders', label: 'الطلبات', icon: '📦' },
    { href: '/dashboard/menu', label: 'القائمة', icon: '📋' },
]

/**
 * تخطيط لوحة تحكم المطعم - قائمة جانبية مع محتوى رئيسي
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { user, loading } = useAuth()

    if (loading) return <PageSpinner />

    // التحقق من أن المستخدم صاحب مطعم
    if (!user || user.role !== 'restaurant') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-4xl mb-4">🔒</p>
                    <p className="text-xl text-gray-500">هذه الصفحة مخصصة لأصحاب المطاعم فقط</p>
                    <Link href="/" className="text-primary-600 hover:underline mt-2 block">
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* القائمة الجانبية */}
            <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:block">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">لوحة التحكم</h2>
                    <p className="text-sm text-gray-500">{user.full_name}</p>
                </div>
                <nav className="px-3 space-y-1">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* القائمة السفلية للجوال */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
                <nav className="flex justify-around py-2">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${isActive ? 'text-primary-600' : 'text-gray-500'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* المحتوى الرئيسي */}
            <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8">{children}</main>
        </div>
    )
}
