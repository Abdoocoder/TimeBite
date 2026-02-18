'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Order, OrderStatusHistory, OrderStatus } from '@/types'
import { OrderStatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'

/** ترتيب حالات الطلب */
const STATUS_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'pending', label: 'قيد الانتظار', icon: '⏳' },
    { status: 'preparing', label: 'قيد التحضير', icon: '👨‍🍳' },
    { status: 'on_way', label: 'في الطريق', icon: '🛵' },
    { status: 'delivered', label: 'تم التوصيل', icon: '✅' },
]

/**
 * صفحة تتبع الطلب - تعرض تفاصيل الطلب مع خط زمني للحالات
 */
export default function OrderTrackingPage() {
    const params = useParams()
    const { user, loading: authLoading } = useAuth()
    const [order, setOrder] = useState<(Order & { status_history: OrderStatusHistory[] }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrder = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(`/api/orders/${params.id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
            } else {
                setOrder(data)
            }
        } catch {
            setError('فشل في تحميل الطلب')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        if (!authLoading && user) fetchOrder()
        else if (!authLoading) setLoading(false)
    }, [authLoading, user, fetchOrder])

    if (loading || authLoading) return <PageSpinner label="جاري تحميل الطلب..." />
    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-xl text-red-600">{error || 'الطلب غير موجود'}</p>
            </div>
        )
    }

    // تحديد مرحلة الطلب الحالية
    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status)
    const isCancelled = order.status === 'cancelled'

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* رأس الطلب */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            تتبع الطلب
                        </h1>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-gray-500">طلب #{order.id.slice(0, 8)}</p>
                </div>

                {/* الخط الزمني */}
                {!isCancelled && (
                    <Card className="mb-6">
                        <CardHeader>
                            <h2 className="font-bold text-gray-900">حالة الطلب</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {STATUS_STEPS.map((step, index) => {
                                    const isActive = index <= currentStepIndex
                                    const isCurrent = index === currentStepIndex
                                    return (
                                        <React.Fragment key={step.status}>
                                            <div className="flex flex-col items-center text-center">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all ${isCurrent
                                                        ? 'bg-primary-500 text-white shadow-lg scale-110 animate-pulse'
                                                        : isActive
                                                            ? 'bg-primary-500 text-white'
                                                            : 'bg-gray-200 text-gray-400'
                                                        }`}
                                                >
                                                    {step.icon}
                                                </div>
                                                <p className={`text-xs font-medium ${isActive ? 'text-primary-700' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <div
                                                    className={`flex-1 h-1 mx-2 rounded ${index < currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'
                                                        }`}
                                                />
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ملغي */}
                {isCancelled && (
                    <Card className="mb-6 border-red-200">
                        <CardContent>
                            <div className="text-center py-4">
                                <p className="text-4xl mb-2">❌</p>
                                <p className="text-lg font-bold text-red-600">تم إلغاء الطلب</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* وقت التوصيل المتوقع */}
                {order.estimated_delivery_time && !isCancelled && order.status !== 'delivered' && (
                    <Card className="mb-6 bg-primary-50 border-primary-200">
                        <CardContent>
                            <div className="text-center">
                                <p className="text-sm text-primary-600 mb-1">وقت التوصيل المتوقع</p>
                                <p className="text-2xl font-bold text-primary-700">
                                    {new Date(order.estimated_delivery_time).toLocaleTimeString('ar-JO', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* تفاصيل الطلب */}
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="font-bold text-gray-900">تفاصيل الطلب</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">عنوان التوصيل</span>
                                <span className="text-gray-900">📍 {order.delivery_address}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">رسوم التوصيل</span>
                                <span>{order.delivery_fee} د.أ</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-3">
                                <span className="text-gray-500">تاريخ الطلب</span>
                                <span>
                                    {new Date(order.created_at).toLocaleDateString('ar-JO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-3">
                                <span>المجموع الكلي</span>
                                <span className="text-primary-600">{order.total_price} د.أ</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* سجل الحالات */}
                {order.status_history && order.status_history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <h2 className="font-bold text-gray-900">سجل التحديثات</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {order.status_history.map((entry) => (
                                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-gray-900">{entry.notes || entry.status}</p>
                                            <p className="text-gray-400 text-xs">
                                                {new Date(entry.timestamp).toLocaleString('ar-JO')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
