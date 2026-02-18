'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { PageSpinner } from '@/components/ui/spinner'

/**
 * صفحة إدارة قائمة المطعم - إضافة وتعديل وحذف عناصر القائمة
 */
export default function MenuManagementPage() {
    const { user } = useAuth()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

    // حقول النموذج
    const [formName, setFormName] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formPrice, setFormPrice] = useState('')

    const fetchData = useCallback(async () => {
        try {
            if (!user) return

            // جلب معرف المطعم
            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', user.id)
                .limit(1)

            if (restaurants && restaurants.length > 0) {
                const rId = restaurants[0].id
                setRestaurantId(rId)

                // جلب عناصر القائمة
                const { data: items } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', rId)
                    .order('name')

                if (items) setMenuItems(items)
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

    // فتح نموذج إضافة
    const openAddModal = () => {
        setEditingItem(null)
        setFormName('')
        setFormDescription('')
        setFormPrice('')
        setShowModal(true)
    }

    // فتح نموذج تعديل
    const openEditModal = (item: MenuItem) => {
        setEditingItem(item)
        setFormName(item.name)
        setFormDescription(item.description)
        setFormPrice(item.price.toString())
        setShowModal(true)
    }

    // حفظ العنصر (إضافة أو تعديل)
    const handleSave = async () => {
        if (!restaurantId || !formName || !formPrice) return

        setSaving(true)
        try {
            if (editingItem) {
                // تعديل عنصر موجود
                const { error } = await supabase
                    .from('menu_items')
                    .update({
                        name: formName,
                        description: formDescription,
                        price: parseFloat(formPrice),
                    })
                    .eq('id', editingItem.id)

                if (!error) {
                    setMenuItems((prev) =>
                        prev.map((i) =>
                            i.id === editingItem.id
                                ? { ...i, name: formName, description: formDescription, price: parseFloat(formPrice) }
                                : i
                        )
                    )
                }
            } else {
                // إضافة عنصر جديد
                const { data, error } = await supabase
                    .from('menu_items')
                    .insert({
                        restaurant_id: restaurantId,
                        name: formName,
                        description: formDescription,
                        price: parseFloat(formPrice),
                        is_available: true,
                    })
                    .select()
                    .single()

                if (!error && data) {
                    setMenuItems((prev) => [...prev, data])
                }
            }
            setShowModal(false)
        } catch (error) {
            console.error('خطأ في حفظ العنصر:', error)
        } finally {
            setSaving(false)
        }
    }

    // تبديل توفر العنصر
    const toggleAvailability = async (item: MenuItem) => {
        const newValue = !item.is_available
        const { error } = await supabase
            .from('menu_items')
            .update({ is_available: newValue })
            .eq('id', item.id)

        if (!error) {
            setMenuItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, is_available: newValue } : i))
            )
        }
    }

    // حذف عنصر
    const deleteItem = async (itemId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return

        const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
        if (!error) {
            setMenuItems((prev) => prev.filter((i) => i.id !== itemId))
        }
    }

    if (loading) return <PageSpinner label="جاري تحميل القائمة..." />

    if (!restaurantId) {
        return (
            <div className="text-center py-16">
                <p className="text-xl text-gray-500">لم يتم ربط مطعم بحسابك بعد</p>
                <p className="text-gray-400 mt-2">يرجى التواصل مع الإدارة لربط مطعمك</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📋 إدارة القائمة</h1>
                    <p className="text-gray-500">{menuItems.length} عنصر في القائمة</p>
                </div>
                <Button onClick={openAddModal}>+ إضافة عنصر</Button>
            </div>

            {/* قائمة العناصر */}
            {menuItems.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">📋</p>
                    <p className="text-xl text-gray-500 mb-4">القائمة فارغة</p>
                    <Button onClick={openAddModal}>أضف أول عنصر</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                            <CardContent>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.description || 'بدون وصف'}</p>
                                    </div>
                                    <Badge variant={item.is_available ? 'success' : 'danger'} size="sm">
                                        {item.is_available ? 'متوفر' : 'غير متوفر'}
                                    </Badge>
                                </div>
                                <p className="text-lg font-bold text-primary-600 mb-3">
                                    {item.price.toFixed(2)} د.أ
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
                                        تعديل
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleAvailability(item)}
                                    >
                                        {item.is_available ? 'إيقاف' : 'تفعيل'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        حذف
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* نافذة الإضافة/التعديل */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingItem ? 'تعديل عنصر' : 'إضافة عنصر جديد'}
            >
                <div className="space-y-4">
                    <Input
                        label="اسم العنصر"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="مثال: شاورما لحم"
                        required
                    />
                    <Textarea
                        label="الوصف"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="وصف مختصر للعنصر..."
                    />
                    <Input
                        label="السعر (د.أ)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="0.00"
                        required
                    />
                    <div className="flex gap-2 pt-2">
                        <Button
                            className="flex-1"
                            onClick={handleSave}
                            isLoading={saving}
                            disabled={!formName || !formPrice}
                        >
                            {editingItem ? 'حفظ التعديلات' : 'إضافة العنصر'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(false)}
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
