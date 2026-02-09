import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Spanish Learning Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Master Spanish with interactive lessons and homework
        </p>
        <Link 
          href="/onboarding"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}