'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function AssignmentDetail() {
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadAssignment()
  }, [])

  const loadAssignment = async () => {
    try {
      const assignmentId = params.id as string

      // Load assignment
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select(`
          *,
          lessons (title, description),
          classes (name, code)
        `)
        .eq('id', assignmentId)
        .single()

      setAssignment(assignmentData)

      // Load submissions
      const { data: submissionsData } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          users (name, email)
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error('Error loading assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (submissionId: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          score,
          teacher_feedback: feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error

      loadAssignment()
      alert('Grade saved successfully!')
    } catch (error) {
      console.error('Error grading:', error)
      alert('Failed to save grade')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  const completedCount = submissions.filter(s => s.completed).length
  const gradedCount = submissions.filter(s => s.graded_at).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/teacher" className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="space-y-6">
          {/* Assignment Header */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
                <p className="text-gray-600">Lesson: {assignment.lessons?.title}</p>
                <p className="text-sm text-gray-500">Class: {assignment.classes?.name}</p>
                {assignment.due_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(assignment.due_date).toLocaleString()}
                  </p>
                )}
              </div>
              <Link
                href={`/teacher/lessons/${assignment.lesson_id}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                View Lesson
              </Link>
            </div>

            {assignment.description && (
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-gray-700">{assignment.description}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-gray-800">{submissions.length}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-gray-800">{completedCount}</div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-gray-800">{gradedCount}</div>
              <div className="text-gray-600">Graded</div>
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Submissions</h2>

            <div className="space-y-4">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onGrade={handleGrade}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmissionCard({ submission, onGrade }: any) {
  const [isGrading, setIsGrading] = useState(false)
  const [score, setScore] = useState(submission.score || 0)
  const [feedback, setFeedback] = useState(submission.teacher_feedback || '')

  const handleSubmitGrade = () => {
    onGrade(submission.id, score, feedback)
    setIsGrading(false)
  }

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{submission.users?.name}</h3>
          <p className="text-sm text-gray-500">{submission.users?.email}</p>
        </div>
        <div className="text-right">
          {submission.completed ? (
            <>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Completed
              </span>
              {submission.submitted_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
              Not Started
            </span>
          )}
        </div>
      </div>

      {submission.completed && (
        <>
          {submission.graded_at ? (
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">Score: {submission.score}/100</span>
                <button
                  onClick={() => setIsGrading(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Edit Grade
                </button>
              </div>
              {submission.teacher_feedback && (
                <p className="text-sm text-gray-700">Feedback: {submission.teacher_feedback}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Graded {new Date(submission.graded_at).toLocaleString()}
              </p>
            </div>
          ) : isGrading ? (
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Score (out of 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Feedback (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800"
                  rows={2}
                  placeholder="Great work! or Areas to improve..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitGrade}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Save Grade
                </button>
                <button
                  onClick={() => setIsGrading(false)}
                  className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsGrading(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700"
            >
              Grade This Submission
            </button>
          )}
        </>
      )}
    </div>
  )
}