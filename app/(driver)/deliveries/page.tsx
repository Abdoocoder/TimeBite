'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * صفحة التوصيلات - تعرض التوصيلات المسندة للسائق والطلبات المتاحة
 */
export default function DeliveriesPage() {
    const { user } = useAuth()
    const [myDeliveries, setMyDeliveries] = useState<Order[]>([])
    const [availableOrders, setAvailableOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState<string | null>(null)

    const fetchDeliveries = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !user) return

            // جلب توصيلاتي
            const res = await fetch('/api/orders?role=driver', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const myData = await res.json()
            if (Array.isArray(myData)) {
                setMyDeliveries(myData)
            }

            // جلب الطلبات المتاحة (on_way بدون سائق)
            const { data: available } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'on_way')
                .is('driver_id', null)
                .order('created_at', { ascending: false })

            if (available) {
                setAvailableOrders(available)
            }
        } catch (error) {
            console.error('خطأ في جلب التوصيلات:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchDeliveries()
    }, [user, fetchDeliveries])

    // قبول طلب توصيل
    const acceptDelivery = async (orderId: string) => {
        setAcceptingId(orderId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !user) return

            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    status: 'on_way',
                    driver_id: user.id,
                    notes: 'تم قبول التوصيل من السائق',
                }),
            })

            // إعادة تحميل البيانات
            await fetchDeliveries()
        } catch (error) {
            console.error('خطأ في قبول التوصيل:', error)
        } finally {
            setAcceptingId(null)
        }
    }

    if (loading) return <PageSpinner label="جاري تحميل التوصيلات..." />

    const activeDeliveries = myDeliveries.filter((d) => d.status === 'on_way')
    const completedDeliveries = myDeliveries.filter((d) => d.status === 'delivered')

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">🛵 التوصيلات</h1>

            {/* توصيلاتي النشطة */}
            <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    توصيلات نشطة ({activeDeliveries.length})
                </h2>
                {activeDeliveries.length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-center text-gray-500 py-4">
                                لا توجد توصيلات نشطة حالياً
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {activeDeliveries.map((delivery) => (
                            <Link key={delivery.id} href={`/deliveries/${delivery.id}`}>
                                <Card hoverable className="mb-3">
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    طلب #{delivery.id.slice(0, 8)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    📍 {delivery.delivery_address}
                                                </p>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-primary-600">
                                                    {delivery.total_price} د.أ
                                                </p>
                                                <OrderStatusBadge status={delivery.status} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* طلبات متاحة */}
            <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    طلبات متاحة للتوصيل ({availableOrders.length})
                </h2>
                {availableOrders.length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-center text-gray-500 py-4">
                                لا توجد طلبات متاحة حالياً
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {availableOrders.map((order) => (
                            <Card key={order.id}>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                طلب #{order.id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                📍 {order.delivery_address}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {new Date(order.created_at).toLocaleTimeString('ar-JO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="font-bold text-primary-600">
                                                {order.total_price} د.أ
                                            </p>
                                            <Button
                                                size="sm"
                                                isLoading={acceptingId === order.id}
                                                onClick={() => acceptDelivery(order.id)}
                                            >
                                                قبول التوصيل
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* توصيلات مكتملة */}
            {completedDeliveries.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        توصيلات مكتملة ({completedDeliveries.length})
                    </h2>
                    <div className="space-y-3">
                        {completedDeliveries.slice(0, 10).map((delivery) => (
                            <Card key={delivery.id} className="opacity-70">
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                طلب #{delivery.id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                📍 {delivery.delivery_address}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-600">
                                                {delivery.total_price} د.أ
                                            </p>
                                            <OrderStatusBadge status={delivery.status} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
