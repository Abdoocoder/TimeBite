'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/types'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<UserRole>('customer')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            })

            if (error) {
                // Provide more helpful error messages
                if (error.message.includes('500') || error.status === 500) {
                    throw new Error('خطأ في الخادم. يرجى التحقق من إعدادات Supabase والمحاولة لاحقاً.')
                }
                if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                    throw new Error('هذا البريد الإلكتروني مسجل بالفعل.')
                }
                throw error
            }

            if (data.user) {
                // Insert profile row into users table
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        full_name: fullName,
                        phone: '',
                        role: role,
                    })

                if (profileError) {
                    console.error('Error creating user profile:', profileError)
                }

                alert('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.')
                router.push('/login')
            } else if (data.session) {
                // User was created without email confirmation
                alert('تم إنشاء الحساب بنجاح!')
                router.push('/')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        إنشاء حساب جديد
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <Input
                            label="الاسم الكامل"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="أدخل اسمك الكامل"
                        />
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                        />
                        <Input
                            label="كلمة المرور"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">نوع الحساب</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="customer">عميل (طلب طعام)</option>
                                <option value="restaurant">صاحب مطعم</option>
                                <option value="driver">سائق توصيل</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            إنشاء حساب
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
