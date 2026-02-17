import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'TimeBite - Food Delivery on Time',
    description: 'Reliable food delivery in Amman with accurate delivery time estimates',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>{children}</body>
        </html>
    )
}
