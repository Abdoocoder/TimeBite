import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/orders
 * جلب الطلبات - يتم تصفيتها حسب دور المستخدم
 * - العميل: طلباته فقط
 * - المطعم: طلبات مطعمه
 * - السائق: الطلبات المسندة إليه
 */
export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // استخراج التوكن من الهيدر
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const role = searchParams.get('role') || 'customer'

        let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

        // تصفية حسب الدور
        if (role === 'customer') {
            query = query.eq('customer_id', user.id)
        } else if (role === 'restaurant') {
            // جلب طلبات مطعم المالك
            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', user.id)

            if (restaurants && restaurants.length > 0) {
                query = query.in('restaurant_id', restaurants.map(r => r.id))
            } else {
                return NextResponse.json([])
            }
        } else if (role === 'driver') {
            query = query.eq('driver_id', user.id)
        }

        // تصفية حسب الحالة (اختياري)
        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
    }
}

/**
 * POST /api/orders
 * إنشاء طلب جديد
 */
export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // التحقق من المصادقة
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const body = await request.json()
        const { restaurant_id, items, delivery_address } = body

        // حساب السعر الإجمالي
        const totalPrice = items.reduce(
            (sum: number, item: { price: number; quantity: number }) =>
                sum + item.price * item.quantity,
            0
        )

        // حساب وقت التوصيل المتوقع (30 دقيقة افتراضياً)
        const estimatedDeliveryTime = new Date()
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 30)

        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_id: user.id,
                restaurant_id,
                items: JSON.stringify(items),
                total_price: totalPrice,
                delivery_fee: 1.00,
                delivery_address,
                estimated_delivery_time: estimatedDeliveryTime.toISOString(),
                status: 'pending',
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // إضافة سجل حالة الطلب
        await supabase.from('order_status_history').insert({
            order_id: data.id,
            status: 'pending',
            notes: 'تم إنشاء الطلب',
        })

        return NextResponse.json(data, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
    }
}
