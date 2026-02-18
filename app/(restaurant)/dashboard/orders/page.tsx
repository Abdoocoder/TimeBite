'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ui/spinner'

/** الحالة التالية لكل حالة */
const NEXT_STATUS: Record<string, { status: OrderStatus; label: string } | null> = {
    pending: { status: 'preparing', label: 'بدء التحضير' },
    preparing: { status: 'on_way', label: 'جاهز للتوصيل' },
    on_way: null, // السائق يتحكم بهذه
    delivered: null,
    cancelled: null,
}

/**
 * صفحة إدارة طلبات المطعم - عرض وتحديث حالات الطلبات
 */
export default function RestaurantOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const fetchOrders = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/orders?role=restaurant', {
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
        if (user) fetchOrders()
    }, [user, fetchOrders])

    // تحديث حالة الطلب
    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingId(orderId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            })

            // تحديث القائمة محلياً
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            )
        } catch (error) {
            console.error('خطأ في تحديث الطلب:', error)
        } finally {
            setUpdatingId(null)
        }
    }

    // إلغاء طلب
    const cancelOrder = async (orderId: string) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return
        await updateOrderStatus(orderId, 'cancelled')
    }

    if (loading) return <PageSpinner label="جاري تحميل الطلبات..." />

    // تصفية الطلبات
    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter((o) => o.status === filterStatus)

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📦 إدارة الطلبات</h1>

            {/* أزرار التصفية */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { value: 'all', label: 'الكل' },
                    { value: 'pending', label: 'قيد الانتظار' },
                    { value: 'preparing', label: 'قيد التحضير' },
                    { value: 'on_way', label: 'في الطريق' },
                    { value: 'delivered', label: 'تم التوصيل' },
                    { value: 'cancelled', label: 'ملغي' },
                ].map((filter) => (
                    <Button
                        key={filter.value}
                        variant={filterStatus === filter.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus(filter.value)}
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>

            {/* قائمة الطلبات */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">لا توجد طلبات</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const nextAction = NEXT_STATUS[order.status]
                        return (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                طلب #{order.id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleString('ar-JO')}
                                            </p>
                                        </div>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600">
                                                📍 {order.delivery_address}
                                            </p>
                                            <p className="font-bold text-lg text-primary-600">
                                                {order.total_price} د.أ
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {nextAction && (
                                                <Button
                                                    size="sm"
                                                    isLoading={updatingId === order.id}
                                                    onClick={() =>
                                                        updateOrderStatus(order.id, nextAction.status)
                                                    }
                                                >
                                                    {nextAction.label}
                                                </Button>
                                            )}
                                            {order.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => cancelOrder(order.id)}
                                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                                >
                                                    إلغاء
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
