'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LessonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonTitle = searchParams.get('title') || 'Lesson'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">{lessonTitle}</h1>
        <p className="text-gray-600 mb-8">This is the lesson content. It will be implemented later.</p>
        <Link href="/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
