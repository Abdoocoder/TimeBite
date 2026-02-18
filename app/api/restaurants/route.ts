import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/restaurants
 * جلب جميع المطاعم النشطة مع نسبة الدقة
 * يدعم البحث بالاسم عبر query parameter "search"
 */
export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')

        let query = supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('on_time_accuracy', { ascending: false })

        // تصفية حسب اسم المطعم (اختياري)
        if (search) {
            query = query.ilike('name', `%${search}%`)
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
