import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/orders/[id]
 * جلب تفاصيل طلب واحد مع سجل الحالات
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        // جلب الطلب
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single()

        if (orderError) {
            return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
        }

        // جلب سجل حالات الطلب
        const { data: statusHistory } = await supabase
            .from('order_status_history')
            .select('*')
            .eq('order_id', id)
            .order('timestamp', { ascending: true })

        return NextResponse.json({
            ...order,
            status_history: statusHistory || [],
        })
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
    }
}

/**
 * PATCH /api/orders/[id]
 * تحديث حالة الطلب
 * - المطعم يمكنه: pending → preparing, preparing → on_way
 * - السائق يمكنه: on_way → delivered
 * - أي طرف يمكنه: → cancelled
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

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
        const { status, notes, driver_id } = body

        // تحديث الطلب
        const updateData: Record<string, unknown> = { status }

        // إذا كانت الحالة "تم التوصيل" نضيف وقت التوصيل الفعلي
        if (status === 'delivered') {
            updateData.actual_delivery_time = new Date().toISOString()
        }

        // إسناد السائق إذا تم تقديمه
        if (driver_id) {
            updateData.driver_id = driver_id
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // إضافة سجل حالة جديد
        await supabase.from('order_status_history').insert({
            order_id: id,
            status,
            notes: notes || `تم تحديث الحالة إلى ${status}`,
        })

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
    }
}
