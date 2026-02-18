'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Order, Restaurant } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * الصفحة الرئيسية للوحة تحكم المطعم
 * تعرض إحصائيات اليوم والطلبات النشطة
 */
export default function RestaurantDashboardPage() {
    const { user } = useAuth()
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !user) return

            // جلب بيانات المطعم
            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .limit(1)

            if (restaurants && restaurants.length > 0) {
                setRestaurant(restaurants[0])
            }

            // جلب الطلبات
            const res = await fetch('/api/orders?role=restaurant', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const orderData = await res.json()
            if (Array.isArray(orderData)) {
                setOrders(orderData)
            }
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchData()
    }, [user, fetchData])

    if (loading) return <PageSpinner label="جاري تحميل لوحة التحكم..." />

    // إحصائيات
    const todayOrders = orders.filter((o) => {
        const today = new Date().toDateString()
        return new Date(o.created_at).toDateString() === today
    })
    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
    const deliveredToday = todayOrders.filter((o) => o.status === 'delivered')
    const todayRevenue = deliveredToday.reduce((sum, o) => sum + Number(o.total_price), 0)

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                مرحباً، {user?.full_name} 👋
            </h1>
            <p className="text-gray-500 mb-8">
                {restaurant ? `إدارة مطعم ${restaurant.name}` : 'لم يتم ربط مطعم بحسابك بعد'}
            </p>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{activeOrders.length}</p>
                        <p className="text-sm text-gray-500">طلبات نشطة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{todayOrders.length}</p>
                        <p className="text-sm text-gray-500">طلبات اليوم</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {restaurant?.on_time_accuracy || 100}%
                        </p>
                        <p className="text-sm text-gray-500">نسبة الدقة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center">
                        <p className="text-3xl font-bold text-orange-600">
                            {todayRevenue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">إيرادات اليوم (د.أ)</p>
                    </CardContent>
                </Card>
            </div>

            {/* الطلبات النشطة */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">🔥 الطلبات النشطة</h2>
                        <Link href="/dashboard/orders">
                            <Button variant="ghost" size="sm">عرض الكل</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeOrders.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">لا توجد طلبات نشطة حالياً</p>
                    ) : (
                        <div className="space-y-3">
                            {activeOrders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            طلب #{order.id.slice(0, 8)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleTimeString('ar-JO', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">
                                            {order.total_price} د.أ
                                        </span>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
