'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export const Navbar = () => {
    const { user, signOut, loading } = useAuth()

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-primary-600 text-2xl font-bold">TimeBite</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4 space-x-reverse">
                        {loading ? (
                            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
                        ) : user ? (
                            <>
                                <div className="flex flex-col items-end mr-4">
                                    <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                                    <span className="text-xs text-gray-500">
                                        {user.role === 'customer' ? 'عميل' : user.role === 'restaurant' ? 'صاحب مطعم' : 'سائق'}
                                    </span>
                                </div>
                                {user.role === 'restaurant' && (
                                    <Link href="/dashboard">
                                        <Button variant="outline" size="sm">لوحة التحكم</Button>
                                    </Link>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                                    تسجيل الخروج
                                </Button>
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
            </div>
        </nav>
    )
}
