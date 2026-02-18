import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/restaurants/[id]
 * جلب تفاصيل مطعم واحد مع عناصر القائمة
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // جلب بيانات المطعم
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', id)
            .single()

        if (restaurantError) {
            return NextResponse.json(
                { error: 'المطعم غير موجود' },
                { status: 404 }
            )
        }

        // جلب عناصر القائمة
        const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', id)
            .eq('is_available', true)
            .order('name')

        if (menuError) {
            return NextResponse.json({ error: menuError.message }, { status: 500 })
        }

        return NextResponse.json({
            ...restaurant,
            menu_items: menuItems || [],
        })
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
    }
}
