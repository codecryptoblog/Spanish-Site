'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateClass() {
  const [className, setClassName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user's school_id
      const { data: userData } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', user.id)
        .single()

      const classCode = generateClassCode()

      const { data, error: insertError } = await supabase
        .from('classes')
        .insert({
          name: className,
          code: classCode,
          teacher_id: user.id,
          school_id: userData?.school_id,
          grade_level: gradeLevel
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/teacher/classes/${data.id}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/teacher" className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏫</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Class</h1>
            <p className="text-gray-600">Set up a class and get your unique class code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="className" className="block text-sm font-semibold text-gray-700 mb-2">
                Class Name
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                placeholder="e.g., Spanish 1 - Period 3"
                required
              />
            </div>

            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                required
              >
                <option value="">Select grade level</option>
                <option value="6th Grade">6th Grade</option>
                <option value="7th Grade">7th Grade</option>
                <option value="8th Grade">8th Grade</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="College">College</option>
                <option value="Adult Education">Adult Education</option>
              </select>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Once you create this class, you'll receive a unique class code. 
                Share this code with your students so they can join!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}