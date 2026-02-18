import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client lazily to avoid build-time issues during SSG
let _supabase: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient => {
    if (!_supabase) {
        // Use placeholder values for build time to avoid crashes
        const url = supabaseUrl || 'https://placeholder.supabase.co'
        const key = supabaseAnonKey || 'placeholder-key'
        _supabase = createClient(url, key, {
            auth: {
                persistSession: false, // Disable for SSR/SSG
                autoRefreshToken: false,
            },
        })
    }
    return _supabase
}

// Create a proxy that lazily initializes the client
// This avoids creating the client during module import at build time
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return getSupabase()[prop as keyof SupabaseClient]
    },
})
