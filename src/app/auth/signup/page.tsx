'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student')
  const [schoolName, setSchoolName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'teacher') setAccountType('teacher')
    
    const data = localStorage.getItem('onboarding_answers')
    if (data) {
      setOnboardingData(JSON.parse(data))
    }
  }, [searchParams])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: accountType,
            school_name: schoolName,
            onboarding_data: onboardingData
          },
        },
      })

      if (authError) throw authError

      localStorage.removeItem('onboarding_answers')
      
      // Redirect based on account type
      if (accountType === 'teacher') {
        router.push('/teacher/setup')
      } else {
        router.push('/payment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">🦜</div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-700 font-medium">
              {accountType === 'teacher' ? '👨‍🏫 Teacher Registration' : '🎓 Student Registration'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join LearnSmart today!</p>
          </div>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                accountType === 'student'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setAccountType('teacher')}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                accountType === 'teacher'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👨‍🏫 Teacher
            </button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
                placeholder={accountType === 'teacher' ? 'Ms. García' : 'Juan Pérez'}
                required
              />
            </div>

            {accountType === 'teacher' && (
              <div>
                <label htmlFor="schoolName" className="block text-sm font-semibold text-gray-700 mb-2">
                  School/Institution Name
                </label>
                <input
                  id="schoolName"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
                  placeholder="Lincoln High School"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="mt-2 text-xs text-gray-500">At least 6 characters</p>
            </div>

            {accountType === 'teacher' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  <strong>Teachers:</strong> You'll get 30 days free to try all features. 
                  After that, pricing starts at $10/month for up to 30 students.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                accountType === 'teacher' ? 'Create Teacher Account' : 'Continue to Payment'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-purple-600 font-semibold hover:text-purple-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}