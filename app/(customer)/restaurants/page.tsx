'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Restaurant } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { AccuracyBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * صفحة تصفح المطاعم - تعرض المطاعم النشطة مع نسبة الدقة
 * يمكن البحث بالاسم
 */
export default function RestaurantsPage() {
    const { user } = useAuth()
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // جلب المطاعم عند تحميل الصفحة
    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async (search?: string) => {
        try {
            setLoading(true)
            const url = search
                ? `/api/restaurants?search=${encodeURIComponent(search)}`
                : '/api/restaurants'
            const res = await fetch(url)
            const data = await res.json()
            if (Array.isArray(data)) {
                setRestaurants(data)
            }
        } catch (error) {
            console.error('خطأ في جلب المطاعم:', error)
        } finally {
            setLoading(false)
        }
    }

    // البحث مع تأخير
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRestaurants(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    if (loading && restaurants.length === 0) {
        return <PageSpinner label="جاري تحميل المطاعم..." />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* رأس الصفحة */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🍽️ المطاعم
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {user ? `أهلاً ${user.full_name}، ` : ''}اختر مطعمك المفضل وشاهد نسبة التزامهم بالوقت
                    </p>

                    {/* حقل البحث */}
                    <div className="max-w-md">
                        <Input
                            type="search"
                            placeholder="ابحث عن مطعم..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* قائمة المطاعم */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {restaurants.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">
                            {searchQuery ? 'لم يتم العثور على مطاعم مطابقة' : 'لا توجد مطاعم متاحة حالياً'}
                        </p>
                        <p className="text-gray-400 mt-2">يتم إضافة مطاعم جديدة باستمرار</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                                <Card hoverable className="h-full">
                                    {/* صورة المطعم (بديل) */}
                                    <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                        <span className="text-6xl">🍔</span>
                                    </div>
                                    <CardContent>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {restaurant.name}
                                            </h3>
                                            <AccuracyBadge accuracy={restaurant.on_time_accuracy} />
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {restaurant.description || 'مطعم مميز في عمّان'}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>📍 {restaurant.address}</span>
                                            <span>⏱️ {restaurant.avg_prep_time} دقيقة</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
