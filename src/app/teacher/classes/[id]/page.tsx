'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClassDetail() {
  const [classData, setClassData] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadClassData()
  }, [])

  const loadClassData = async () => {
    try {
      const classId = params.id as string

      // Load class info
      const { data: classInfo } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      setClassData(classInfo)

      // Load students
      const { data: studentsData } = await supabase
        .from('class_students')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq('class_id', classId)

      setStudents(studentsData || [])

      // Load assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`
          *,
          lessons (title),
          assignment_submissions (count)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

      setAssignments(assignmentsData || [])

    } catch (error) {
      console.error('Error loading class:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData.code)
    alert('Class code copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/teacher" className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="space-y-6">
          {/* Class Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
                <p className="text-xl text-white/90">{classData.grade_level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-1">Class Code</p>
                <button
                  onClick={copyClassCode}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold text-2xl hover:bg-purple-50 transition-all"
                >
                  {classData.code}
                </button>
                <p className="text-xs text-white/80 mt-1">Click to copy</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-gray-800">{students.length}</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-bold text-gray-800">{assignments.length}</div>
              <div className="text-gray-600">Assignments</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-gray-800">
                {assignments.reduce((sum, a) => sum + (a.assignment_submissions?.[0]?.count || 0), 0)}
              </div>
              <div className="text-gray-600">Submissions</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href={`/teacher/classes/${classData.id}/assign`}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 mb-2">
                Create Assignment
              </h3>
              <p className="text-gray-600">Assign lessons or create tests</p>
            </Link>

            <Link
              href={`/teacher/classes/${classData.id}/progress`}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 mb-2">
                View Progress
              </h3>
              <p className="text-gray-600">See student performance</p>
            </Link>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Students</h2>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-600 mb-4">No students yet</p>
                <p className="text-sm text-gray-500">
                  Share class code <strong>{classData.code}</strong> with your students
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {student.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{student.student_name}</h3>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(student.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/teacher/students/${student.student_id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View Progress →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
              <Link
                href={`/teacher/classes/${classData.id}/assign`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                + New Assignment
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 mb-4">No assignments yet</p>
                <Link
                  href={`/teacher/classes/${classData.id}/assign`}
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  Create your first assignment →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/teacher/assignments/${assignment.id}`}
                    className="block p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">
                          Lesson: {assignment.lessons?.title || 'Custom'}
                        </p>
                        {assignment.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {assignment.assignment_submissions?.[0]?.count || 0}/{students.length} submitted
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}