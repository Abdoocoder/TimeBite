import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
    title: 'TimeBite - Food Delivery on Time',
    description: 'Reliable food delivery in Amman with accurate delivery time estimates',
    icons: {
        icon: '/icon',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <AuthProvider>
                    <Navbar />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
