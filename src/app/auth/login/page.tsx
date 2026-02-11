'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type UserType = 'student' | 'teacher' | 'admin'

export default function Login() {
  const [userType, setUserType] = useState<UserType>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // Redirect based on role
      if (userData?.role === 'admin') {
        router.push('/admin')
      } else if (userData?.role === 'teacher') {
        router.push('/teacher')
      } else {
        router.push('/dashboard')
      }
      
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🦜</div>
          <h1 className="text-4xl font-bold text-white mb-2">LearnSmart</h1>
          <p className="text-white/90">Spanish Learning Platform for Schools</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            {(['student', 'teacher', 'admin'] as UserType[]).map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`py-2 px-4 rounded-lg font-medium transition-all ${
                  userType === type
                    ? 'bg-white text-purple-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type === 'student' && '🎓'}
                {type === 'teacher' && '👨‍🏫'}
                {type === 'admin' && '⚙️'}
                <div className="text-xs mt-1 capitalize">{type}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
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
                placeholder={
                  userType === 'student' ? 'student@school.edu' :
                  userType === 'teacher' ? 'teacher@school.edu' :
                  'admin@learnsmart.com'
                }
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {userType === 'student' && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-2">Have a class code?</p>
                <Link href="/auth/classcode" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center gap-2">
                  <span>🎓</span> Join with Class Code
                </Link>
              </div>
            )}
            
            {userType === 'teacher' && (
              <div className="text-center">
                <p className="text-gray-600">
                  New teacher?{' '}
                  <Link href="/auth/signup?type=teacher" className="text-purple-600 font-semibold hover:text-purple-700">
                    Request Access
                  </Link>
                </p>
              </div>
            )}

            {userType === 'admin' && (
              <div className="text-center text-sm text-gray-500">
                Admin access only. Contact support for credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}