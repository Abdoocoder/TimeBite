'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

/**
 * شريط التنقل الرئيسي - يعرض روابط مختلفة حسب دور المستخدم
 * عميل: المطاعم، طلباتي
 * صاحب مطعم: لوحة التحكم
 * سائق: التوصيلات
 */
export const Navbar = () => {
    const { user, signOut, loading } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    // روابط التنقل حسب الدور
    const getNavLinks = () => {
        if (!user) return []

        switch (user.role) {
            case 'customer':
                return [
                    { href: '/restaurants', label: '🍽️ المطاعم' },
                    { href: '/orders', label: '📦 طلباتي' },
                ]
            case 'restaurant':
                return [
                    { href: '/dashboard', label: '📊 لوحة التحكم' },
                    { href: '/dashboard/orders', label: '📦 الطلبات' },
                    { href: '/dashboard/menu', label: '📋 القائمة' },
                ]
            case 'driver':
                return [
                    { href: '/deliveries', label: '🛵 التوصيلات' },
                ]
            default:
                return []
        }
    }

    const navLinks = getNavLinks()

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* اللوقو */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">TB</span>
                            </div>
                            <span className="text-primary-600 text-xl font-bold hidden sm:block">
                                TimeBite
                            </span>
                        </Link>

                        {/* روابط التنقل (سطح المكتب) */}
                        {navLinks.length > 0 && (
                            <div className="hidden md:flex items-center gap-1 mr-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* معلومات المستخدم + أزرار */}
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
                        ) : user ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {user.full_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {user.role === 'customer' ? 'عميل' : user.role === 'restaurant' ? 'صاحب مطعم' : 'سائق'}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                                    خروج
                                </Button>

                                {/* زر القائمة للجوال */}
                                <button
                                    className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {mobileOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">دخول</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm">إنشاء حساب</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* القائمة المنسدلة للجوال */}
                {mobileOpen && navLinks.length > 0 && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
