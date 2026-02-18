'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Order } from '@/types'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * صفحة طلبات العميل - تعرض جميع طلبات العميل مع حالاتها
 */
export default function CustomerOrdersPage() {
    const { user, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/orders?role=customer', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setOrders(data)
            }
        } catch (error) {
            console.error('خطأ في جلب الطلبات:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders()
        } else if (!authLoading) {
            setLoading(false)
        }
    }, [authLoading, user, fetchOrders])

    if (loading || authLoading) return <PageSpinner label="جاري تحميل الطلبات..." />

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-500 mb-4">يرجى تسجيل الدخول لعرض طلباتك</p>
                    <Link href="/login" className="text-primary-600 hover:underline font-medium">
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 طلباتي</h1>
                <p className="text-gray-600 mb-8">تتبع جميع طلباتك في مكان واحد</p>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-6xl mb-4">🛒</p>
                        <p className="text-xl text-gray-500 mb-4">لا توجد طلبات بعد</p>
                        <Link href="/restaurants" className="text-primary-600 hover:underline font-medium">
                            تصفح المطاعم وابدأ بالطلب
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`}>
                                <Card hoverable className="mb-4">
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    طلب #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString('ar-JO', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                📍 {order.delivery_address}
                                            </span>
                                            <span className="font-bold text-primary-600">
                                                {order.total_price} د.أ
                                            </span>
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
