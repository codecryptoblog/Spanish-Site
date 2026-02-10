'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    level: 'beginner'
  })
  const [subscriptionStatus, setSubscriptionStatus] = useState('free')
  const [lessonsThisMonth, setLessonsThisMonth] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Load user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userData) {
        setSubscriptionStatus(userData.subscription_status || 'free')
        setLessonsThisMonth(userData.lessons_this_month || 0)
        setStats(prev => ({
          ...prev,
          level: userData.spanish_level || 'beginner'
        }))
      }

      // Load available lessons based on level
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_default', true)
        .eq('level', userData?.spanish_level || 'beginner')
        .order('created_at', { ascending: true })
        .limit(10)

      setLessons(lessonsData || [])

      // Load student's assignments
      const { data: classStudents } = await supabase
        .from('class_students')
        .select('class_id')
        .eq('student_id', user.id)

      if (classStudents && classStudents.length > 0) {
        const classIds = classStudents.map(cs => cs.class_id)
        
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select(`
            *,
            lessons (title),
            assignment_submissions!inner (completed, score)
          `)
          .in('class_id', classIds)
          .eq('assignment_submissions.student_id', user.id)
          .order('due_date', { ascending: true })

        setAssignments(assignmentsData || [])
      }

      // Load progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', user.id)

      const completed = progressData?.filter(p => p.completed).length || 0
      const totalPoints = progressData?.reduce((sum, p) => sum + (p.score || 0), 0) || 0

      setStats(prev => ({
        ...prev,
        lessonsCompleted: completed,
        totalPoints
      }))

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const canTakeLesson = () => {
    if (subscriptionStatus === 'pro' || subscriptionStatus === 'lifetime') return true
    return lessonsThisMonth < 5
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦜</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnSmart
              </span>
            </div>
            <div className="flex items-center gap-4">
              {subscriptionStatus === 'free' && (
                <Link 
                  href="/payment"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-yellow-500 hover:to-orange-500"
                >
                  ⭐ Upgrade
                </Link>
              )}
              <span className="text-sm text-gray-700 font-medium">
                {user?.user_metadata?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  ¡Hola, {user?.user_metadata?.name || 'Estudiante'}! 👋
                </h1>
                <p className="text-xl text-white/90">Ready to continue your Spanish journey?</p>
                {subscriptionStatus === 'free' && (
                  <p className="text-sm text-white/80 mt-2">
                    Free Plan: {lessonsThisMonth}/5 lessons used this month
                  </p>
                )}
              </div>
              <div className="text-7xl animate-bounce">
                🦜
              </div>
            </div>
          </div>

          {/* Paywall Warning */}
          {!canTakeLesson() && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Monthly Limit Reached! 🎯</h3>
              <p className="mb-4">You've completed your 5 free lessons this month. Upgrade to continue learning!</p>
              <Link
                href="/payment"
                className="inline-block bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Upgrade Now →
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-bold text-gray-800">{stats.lessonsCompleted}</div>
              <div className="text-gray-600">Lessons Completed</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-gray-800">{stats.currentStreak}</div>
              <div className="text-gray-600">Day Streak</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalPoints}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-xl font-bold text-gray-800 capitalize">{stats.level}</div>
              <div className="text-gray-600">Current Level</div>
            </div>
          </div>

          {/* Assignments */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Assignments</h2>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                        <p className="text-gray-600">Lesson: {assignment.lessons?.title}</p>
                        {assignment.due_date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {assignment.assignment_submissions[0]?.completed ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Completed - {assignment.assignment_submissions[0]?.score}%
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      )}
                    </div>
                    {!assignment.assignment_submissions[0]?.completed && (
                      <Link
                        href={`/lessons/${assignment.lesson_id}`}
                        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-center"
                      >
                        Start Assignment →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Lessons */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Lessons</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-3">
                    {lesson.category === 'vocabulary' ? '📖' : 
                     lesson.category === 'grammar' ? '✍️' : '💬'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold capitalize">
                      {lesson.level}
                    </span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-semibold capitalize">
                      {lesson.category}
                    </span>
                  </div>
                  {canTakeLesson() ? (
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-center"
                    >
                      Start Lesson →
                    </Link>
                  ) : (
                    <Link
                      href="/payment"
                      className="block w-full bg-gray-300 text-gray-600 font-bold py-3 rounded-xl text-center cursor-not-allowed"
                    >
                      🔒 Upgrade to Unlock
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}