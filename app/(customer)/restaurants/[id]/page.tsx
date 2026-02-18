'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Restaurant, MenuItem, OrderItem } from '@/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AccuracyBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { PageSpinner } from '@/components/ui/spinner'

/** نوع عنصر السلة مع بيانات إضافية */
interface CartItem extends OrderItem {
    name: string
}

/**
 * صفحة تفاصيل المطعم - تعرض القائمة مع إمكانية إضافة عناصر للسلة
 * وتقديم الطلب مع عنوان التوصيل
 */
export default function RestaurantDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [ordering, setOrdering] = useState(false)
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [showCartModal, setShowCartModal] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // جلب بيانات المطعم والقائمة
    const fetchRestaurant = useCallback(async () => {
        try {
            const res = await fetch(`/api/restaurants/${params.id}`)
            const data = await res.json()
            if (data.error) {
                setError(data.error)
            } else {
                setRestaurant(data)
                setMenuItems(data.menu_items || [])
            }
        } catch {
            setError('فشل في تحميل بيانات المطعم')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchRestaurant()
    }, [fetchRestaurant])

    // إضافة عنصر للسلة
    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menu_item_id === item.id)
            if (existing) {
                return prev.map((c) =>
                    c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                )
            }
            return [...prev, { menu_item_id: item.id, name: item.name, quantity: 1, price: item.price }]
        })
    }

    // تقليل عنصر من السلة
    const removeFromCart = (menuItemId: string) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menu_item_id === menuItemId)
            if (existing && existing.quantity > 1) {
                return prev.map((c) =>
                    c.menu_item_id === menuItemId ? { ...c, quantity: c.quantity - 1 } : c
                )
            }
            return prev.filter((c) => c.menu_item_id !== menuItemId)
        })
    }

    // حساب المجموع
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 1.0 // رسوم التوصيل (دينار أردني)

    // تقديم الطلب
    const handlePlaceOrder = async () => {
        if (!user) {
            router.push('/login')
            return
        }
        if (!deliveryAddress.trim()) {
            alert('يرجى إدخال عنوان التوصيل')
            return
        }

        setOrdering(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurant?.id,
                    items: cart.map(({ menu_item_id, quantity, price }) => ({
                        menu_item_id,
                        quantity,
                        price,
                    })),
                    delivery_address: deliveryAddress,
                }),
            })

            const data = await res.json()
            if (data.error) {
                alert(data.error)
            } else {
                alert('تم تقديم الطلب بنجاح! 🎉')
                setCart([])
                setShowCartModal(false)
                router.push(`/orders/${data.id}`)
            }
        } catch {
            alert('فشل في تقديم الطلب')
        } finally {
            setOrdering(false)
        }
    }

    if (loading) return <PageSpinner label="جاري تحميل المطعم..." />
    if (error || !restaurant) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-xl text-red-600">{error || 'المطعم غير موجود'}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* رأس المطعم */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
                            🍔
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                            <p className="text-primary-100">{restaurant.description || 'مطعم مميز'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            📍 {restaurant.address}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            📞 {restaurant.phone}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            ⏱️ {restaurant.avg_prep_time} دقيقة تحضير
                        </span>
                        <AccuracyBadge accuracy={restaurant.on_time_accuracy} />
                    </div>
                </div>
            </div>

            {/* القائمة */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 القائمة</h2>

                {menuItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-500">لا توجد عناصر في القائمة حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems.map((item) => {
                            const cartItem = cart.find((c) => c.menu_item_id === item.id)
                            return (
                                <Card key={item.id} className="flex flex-col">
                                    {item.image_url && (
                                        <div className="h-40 bg-gray-200 rounded-t-xl overflow-hidden">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <CardContent className="flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3 flex-1">
                                            {item.description || 'وصف غير متوفر'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary-600">
                                                {item.price.toFixed(2)} د.أ
                                            </span>
                                            {cartItem ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center font-bold">
                                                        {cartItem.quantity}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addToCart(item)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" onClick={() => addToCart(item)}>
                                                    أضف
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* شريط السلة السفلي */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-500 shadow-2xl p-4 z-40">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                {cart.reduce((sum, i) => sum + i.quantity, 0)} عنصر
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                                المجموع: {totalPrice.toFixed(2)} د.أ
                            </p>
                        </div>
                        <Button onClick={() => setShowCartModal(true)}>
                            عرض السلة وتأكيد الطلب
                        </Button>
                    </div>
                </div>
            )}

            {/* نافذة السلة */}
            <Modal
                isOpen={showCartModal}
                onClose={() => setShowCartModal(false)}
                title="🛒 سلة المشتريات"
                size="lg"
            >
                <div className="space-y-4">
                    {/* عناصر السلة */}
                    {cart.map((item) => (
                        <div
                            key={item.menu_item_id}
                            className="flex items-center justify-between border-b pb-3"
                        >
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                    {item.price.toFixed(2)} د.أ × {item.quantity}
                                </p>
                            </div>
                            <p className="font-bold">
                                {(item.price * item.quantity).toFixed(2)} د.أ
                            </p>
                        </div>
                    ))}

                    {/* رسوم التوصيل */}
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>رسوم التوصيل</span>
                        <span>{deliveryFee.toFixed(2)} د.أ</span>
                    </div>

                    {/* المجموع الكلي */}
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                        <span>المجموع الكلي</span>
                        <span className="text-primary-600">
                            {(totalPrice + deliveryFee).toFixed(2)} د.أ
                        </span>
                    </div>

                    {/* عنوان التوصيل */}
                    <Input
                        label="عنوان التوصيل"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="مثال: شارع الجامعة، مقابل مسجد الحسين"
                        required
                    />

                    {/* زر تأكيد الطلب */}
                    <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        isLoading={ordering}
                        disabled={!deliveryAddress.trim()}
                    >
                        تأكيد الطلب ✓
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
