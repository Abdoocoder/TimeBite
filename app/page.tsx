export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-white">
            <div className="text-center space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-5xl font-bold">TB</span>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-4">
                    <h1 className="text-6xl font-bold text-gray-900">
                        TimeBite
                    </h1>
                    <p className="text-2xl text-gray-600">
                        توصيل الطعام في الوقت المحدد
                    </p>
                </div>

                {/* Value Proposition */}
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            ⏰ دقة في الوقت
                        </h2>
                        <p className="text-gray-600">
                            نعرض لك نسبة التزام كل مطعم بالوقت قبل الطلب
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            ✅ شفافية كاملة
                        </h2>
                        <p className="text-gray-600">
                            وقت وصول واقعي بناءً على بيانات حقيقية
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            🔔 إشعارات مبكرة
                        </h2>
                        <p className="text-gray-600">
                            نخبرك فوراً عند أي تأخير متوقع
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="pt-8">
                    <div className="inline-block bg-primary-100 text-primary-700 px-6 py-3 rounded-full font-medium">
                        🚀 قريباً في عمّان
                    </div>
                </div>

                {/* Tech Stack Info */}
                <div className="pt-8 text-sm text-gray-500">
                    <p>Built with Next.js 15 + TypeScript + Tailwind CSS</p>
                </div>
            </div>
        </main>
    )
}
