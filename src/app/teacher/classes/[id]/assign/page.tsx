'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateAssignment() {
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's school_id
      const { data: userData } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', user.id)
        .single()

      // Load default lessons and teacher's custom lessons
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .or(`is_default.eq.true,and(created_by.eq.${user.id},school_id.eq.${userData?.school_id})`)
        .order('level', { ascending: true })

      setLessons(data || [])
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
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

      const classId = params.id as string

      const { error: insertError } = await supabase
        .from('assignments')
        .insert({
          class_id: classId,
          lesson_id: selectedLesson,
          teacher_id: user.id,
          title,
          description,
          due_date: dueDate || null
        })

      if (insertError) throw insertError

      // Create submission records for all students in class
      const { data: students } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId)

      if (students && students.length > 0) {
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('id')
          .eq('class_id', classId)
          .eq('lesson_id', selectedLesson)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (assignmentData) {
          const submissions = students.map(s => ({
            assignment_id: assignmentData.id,
            student_id: s.student_id,
            completed: false
          }))

          await supabase.from('assignment_submissions').insert(submissions)
        }
      }

      router.push(`/teacher/classes/${classId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href={`/teacher/classes/${params.id}`} className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block">
          ← Back to Class
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Assignment</h1>
            <p className="text-gray-600">Assign a lesson to your students</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => {
                  setSelectedLesson(e.target.value)
                  const lesson = lessons.find(l => l.id === e.target.value)
                  if (lesson && !title) {
                    setTitle(lesson.title)
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                required
              >
                <option value="">Choose a lesson...</option>
                <optgroup label="Beginner">
                  {lessons.filter(l => l.level === 'beginner').map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} {lesson.is_default ? '' : '(Custom)'}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Intermediate">
                  {lessons.filter(l => l.level === 'intermediate').map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} {lesson.is_default ? '' : '(Custom)'}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Advanced">
                  {lessons.filter(l => l.level === 'advanced').map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} {lesson.is_default ? '' : '(Custom)'}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="e.g., Week 5 Homework - Greetings"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructions (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                rows={3}
                placeholder="Any special instructions for students..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date (optional)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating Assignment...' : 'Create Assignment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}