'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { User } from '@/types'

interface AuthContextType {
    supabaseUser: SupabaseUser | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    supabaseUser: null,
    user: null,
    loading: true,
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSupabaseUser(session?.user ?? null)

            if (session?.user) {
                await fetchProfile(session.user.id)
            }

            setLoading(false)
        }

        getInitialSession()

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSupabaseUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setUser(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchProfile = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            if (error) throw error
            setUser(data)
        } catch (error) {
            console.error('Error fetching user profile:', error)
            setUser(null)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ supabaseUser, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
