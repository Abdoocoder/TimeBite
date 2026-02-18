'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
    const { user, loading } = useAuth()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-white">
            <div className="text-center space-y-8 max-w-4xl w-full">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-5xl font-bold">TB</span>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-4">
                    <h1 className="text-6xl font-bold text-gray-900">
                        TimeBite
                    </h1>
                    <p className="text-2xl text-gray-600">
                        توصيل الطعام في الوقت المحدد
                    </p>
                </div>

                {loading ? (
                    <div className="h-20 w-full animate-pulse bg-gray-100 rounded-lg"></div>
                ) : user ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            أهلاً بك يا {user.full_name} 👋
                        </h2>
                        <p className="text-gray-600 mb-6">
                            أنت مسجل حالياً كـ {user.role === 'customer' ? 'عميل' : user.role === 'restaurant' ? 'صاحب مطعم' : 'سائق'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.role === 'customer' && (
                                <Link href="/restaurants" className="block text-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                                    <h3 className="font-bold text-primary-700">تصفح المطاعم</h3>
                                    <p className="text-sm text-primary-600">اكتشف المطاعم الأكثر التزاماً بالوقت</p>
                                </Link>
                            )}
                            {user.role === 'restaurant' && (
                                <Link href="/dashboard" className="block text-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                                    <h3 className="font-bold text-primary-700">لوحة التحكم</h3>
                                    <p className="text-sm text-primary-600">أدر طلبات مطعمك وراقب دقة التوصيل</p>
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-primary-600 text-white p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold mb-2">انضم إلينا اليوم</h2>
                            <p className="mb-4">ابدأ بطلب الطعام مع ضمان الوصول في الوقت المحدد</p>
                            <Link href="/signup">
                                <Button variant="secondary">ابدأ الآن</Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Value Proposition */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            ⏰ دقة في الوقت
                        </h2>
                        <p className="text-gray-600">
                            نعرض لك نسبة التزام كل مطعم بالوقت قبل الطلب
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            ✅ شفافية كاملة
                        </h2>
                        <p className="text-gray-600">
                            وقت وصول واقعي بناءً على بيانات حقيقية
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            🔔 إشعارات مبكرة
                        </h2>
                        <p className="text-gray-600">
                            نخبرك فوراً عند أي تأخير متوقع
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                {!user && (
                    <div className="pt-8">
                        <div className="inline-block bg-primary-100 text-primary-700 px-6 py-3 rounded-full font-medium">
                            🚀 قريباً في عمّان
                        </div>
                    </div>
                )}

                {/* Tech Stack Info */}
                <div className="pt-8 text-sm text-gray-500">
                    <p>Built with Next.js 15 + TypeScript + Tailwind CSS</p>
                </div>
            </div>
        </main>
    )
}
