'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * صفحة تفاصيل التوصيل - تعرض تفاصيل الطلب مع زر تأكيد التوصيل
 */
export default function DeliveryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [delivering, setDelivering] = useState(false)

    const fetchOrder = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`/api/orders/${params.id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const data = await res.json()
            if (!data.error) {
                setOrder(data)
            }
        } catch (error) {
            console.error('خطأ:', error)
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        if (user) fetchOrder()
    }, [user, fetchOrder])

    // تأكيد التوصيل
    const markDelivered = async () => {
        if (!confirm('هل تم توصيل الطلب بنجاح؟')) return

        setDelivering(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await fetch(`/api/orders/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    status: 'delivered',
                    notes: 'تم التوصيل بنجاح',
                }),
            })

            alert('تم تأكيد التوصيل بنجاح! ✅')
            router.push('/deliveries')
        } catch (error) {
            console.error('خطأ في تأكيد التوصيل:', error)
            alert('فشل في تأكيد التوصيل')
        } finally {
            setDelivering(false)
        }
    }

    if (loading) return <PageSpinner label="جاري التحميل..." />
    if (!order) {
        return (
            <div className="text-center py-16">
                <p className="text-xl text-red-600">الطلب غير موجود</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">تفاصيل التوصيل</h1>
                    <p className="text-gray-500">طلب #{order.id.slice(0, 8)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            {/* عنوان التوصيل */}
            <Card className="mb-4 bg-primary-50 border-primary-200">
                <CardContent>
                    <h3 className="font-bold text-primary-700 mb-2">📍 عنوان التوصيل</h3>
                    <p className="text-lg text-primary-900">{order.delivery_address}</p>
                </CardContent>
            </Card>

            {/* تفاصيل الطلب */}
            <Card className="mb-4">
                <CardHeader>
                    <h3 className="font-bold text-gray-900">تفاصيل الطلب</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">المجموع</span>
                            <span className="font-bold">{order.total_price} د.أ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">رسوم التوصيل</span>
                            <span>{order.delivery_fee} د.أ</span>
                        </div>
                        {order.estimated_delivery_time && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الوقت المتوقع</span>
                                <span>
                                    {new Date(order.estimated_delivery_time).toLocaleTimeString('ar-JO', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">تاريخ الطلب</span>
                            <span>
                                {new Date(order.created_at).toLocaleString('ar-JO')}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* زر تأكيد التوصيل */}
            {order.status === 'on_way' && (
                <Button
                    className="w-full"
                    size="lg"
                    onClick={markDelivered}
                    isLoading={delivering}
                >
                    ✅ تأكيد التوصيل
                </Button>
            )}

            {order.status === 'delivered' && (
                <div className="text-center py-4">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-lg font-bold text-green-600">تم التوصيل بنجاح</p>
                    {order.actual_delivery_time && (
                        <p className="text-sm text-gray-500">
                            في {new Date(order.actual_delivery_time).toLocaleTimeString('ar-JO')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
