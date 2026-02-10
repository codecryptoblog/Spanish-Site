'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClassCodeLogin() {
  const [classCode, setClassCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Verify class code exists
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('code', classCode.toUpperCase())
        .single()

      if (classError || !classData) {
        throw new Error('Invalid class code')
      }

      // Create anonymous account for student
      const tempEmail = `${classCode.toLowerCase()}.${Date.now()}@learnsmart.temp`
      const tempPassword = Math.random().toString(36).slice(-12)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            name: studentName,
            is_student: true,
            class_code: classCode.toUpperCase(),
            class_id: classData.id
          },
        },
      })

      if (authError) throw authError

      // Create user record
      if (authData.user) {
        await supabase.from('users').upsert({
          id: authData.user.id,
          email: tempEmail,
          name: studentName,
          role: 'student',
          selected_plan: 'free'
        })

        // Add student to class
        await supabase.from('class_students').insert({
          class_id: classData.id,
          student_id: authData.user.id,
          student_name: studentName
        })
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to join class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md">
        {/* Mascot */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">🦜</div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-700 font-medium">
              ¡Hola! Join your class with a code! 🎓
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Join a Class</h1>
            <p className="text-gray-600">Enter your class code to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
                placeholder="Maria García"
                required
              />
            </div>

            <div>
              <label htmlFor="classcode" className="block text-sm font-semibold text-gray-700 mb-2">
                Class Code
              </label>
              <input
                id="classcode"
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 font-mono text-lg text-center"
                placeholder="ABC123"
                maxLength={6}
                required
              />
              <p className="mt-2 text-xs text-gray-500">Ask your teacher for the class code</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining class...
                </span>
              ) : (
                'Join Class'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-3">Don't have a class code?</p>
            <Link href="/auth/signup" className="text-purple-600 font-semibold hover:text-purple-700">
              Create Individual Account
            </Link>
            <span className="text-gray-400 mx-2">·</span>
            <Link href="/auth/login" className="text-purple-600 font-semibold hover:text-purple-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}