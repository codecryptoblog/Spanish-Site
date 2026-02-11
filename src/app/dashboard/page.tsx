'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Hard-coded lessons data as fallback
const HARDCODED_LESSONS = {
  beginner: [
    { id: '1', title: 'Greetings & Introductions', description: 'Learn how to greet people and introduce yourself', level: 'beginner', category: 'conversation' },
    { id: '2', title: 'Numbers 1-100', description: 'Master Spanish numbers from one to one hundred', level: 'beginner', category: 'vocabulary' },
    { id: '3', title: 'Colors & Shapes', description: 'Learn colors and basic shapes in Spanish', level: 'beginner', category: 'vocabulary' },
    { id: '4', title: 'Days & Months', description: 'Days of the week and months of the year', level: 'beginner', category: 'vocabulary' },
    { id: '5', title: 'Family Members', description: 'Vocabulary for talking about your family', level: 'beginner', category: 'vocabulary' },
    { id: '6', title: 'Common Verbs - Present Tense', description: 'Basic verbs in present tense (ser, estar, tener)', level: 'beginner', category: 'grammar' },
    { id: '7', title: 'Food & Drinks', description: 'Essential food and beverage vocabulary', level: 'beginner', category: 'vocabulary' },
    { id: '8', title: 'At School', description: 'Classroom objects and school vocabulary', level: 'beginner', category: 'vocabulary' },
    { id: '9', title: 'Weather & Seasons', description: 'Talking about weather and seasons', level: 'beginner', category: 'conversation' },
    { id: '10', title: 'Basic Questions', description: 'How to ask and answer simple questions', level: 'beginner', category: 'conversation' }
  ],
  intermediate: [
    { id: '11', title: 'Past Tense (Preterite)', description: 'Learn to talk about completed actions in the past', level: 'intermediate', category: 'grammar' },
    { id: '12', title: 'Imperfect Tense', description: 'Describing ongoing past actions and habits', level: 'intermediate', category: 'grammar' },
    { id: '13', title: 'Shopping & Money', description: 'Vocabulary for shopping and discussing prices', level: 'intermediate', category: 'conversation' },
    { id: '14', title: 'Directions & Transportation', description: 'Asking for and giving directions', level: 'intermediate', category: 'conversation' },
    { id: '15', title: 'House & Home', description: 'Rooms, furniture, and household items', level: 'intermediate', category: 'vocabulary' },
    { id: '16', title: 'Health & Body Parts', description: 'Medical vocabulary and describing symptoms', level: 'intermediate', category: 'vocabulary' },
    { id: '17', title: 'Future Tense', description: 'Talking about future plans and predictions', level: 'intermediate', category: 'grammar' },
    { id: '18', title: 'Comparisons', description: 'Comparing things using más/menos que', level: 'intermediate', category: 'grammar' },
    { id: '19', title: 'Hobbies & Free Time', description: 'Discussing activities and pastimes', level: 'intermediate', category: 'conversation' },
    { id: '20', title: 'Making Reservations', description: 'Booking hotels and restaurants', level: 'intermediate', category: 'conversation' }
  ],
  advanced: [
    { id: '21', title: 'Subjunctive Mood - Present', description: 'Expressing wishes, doubts, and emotions', level: 'advanced', category: 'grammar' },
    { id: '22', title: 'Conditional Tense', description: 'Talking about hypothetical situations', level: 'advanced', category: 'grammar' },
    { id: '23', title: 'Business Spanish', description: 'Professional vocabulary and formal communication', level: 'advanced', category: 'conversation' },
    { id: '24', title: 'Subjunctive - Past', description: 'Past subjunctive for hypothetical situations', level: 'advanced', category: 'grammar' },
    { id: '25', title: 'Idiomatic Expressions', description: 'Common Spanish idioms and sayings', level: 'advanced', category: 'vocabulary' },
    { id: '26', title: 'News & Current Events', description: 'Reading and discussing news articles', level: 'advanced', category: 'conversation' },
    { id: '27', title: 'Por vs Para', description: 'Mastering the difference between por and para', level: 'advanced', category: 'grammar' },
    { id: '28', title: 'Formal vs Informal', description: 'Understanding register and formality levels', level: 'advanced', category: 'conversation' },
    { id: '29', title: 'Literature & Culture', description: 'Exploring Spanish and Latin American culture', level: 'advanced', category: 'conversation' },
    { id: '30', title: 'Advanced Conversation', description: 'Debating and complex discussions', level: 'advanced', category: 'conversation' }
  ]
}

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

      // Load user data with error handling
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('User data error:', userError)
        // Use default values if user data fails to load
        setStats(prev => ({ ...prev, level: 'beginner' }))
        setLessons(HARDCODED_LESSONS.beginner)
        setLoading(false)
        return
      }

      if (userData) {
        // Check if user is teacher/admin - redirect them
        if (userData.role === 'teacher' || userData.role === 'school_admin' || userData.role === 'admin') {
          if (userData.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/teacher')
          }
          return
        }

        setSubscriptionStatus(userData.subscription_status || 'free')
        setLessonsThisMonth(userData.lessons_this_month || 0)
        const userLevel = userData.spanish_level || 'beginner'
        setStats(prev => ({
          ...prev,
          level: userLevel
        }))

        // Try to load lessons from database
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('is_default', true)
          .eq('level', userLevel)
          .order('created_at', { ascending: true })

        // Always use hard-coded lessons as fallback
        if (lessonsError || !lessonsData || lessonsData.length === 0) {
          console.log('Using hardcoded lessons')
          setLessons(HARDCODED_LESSONS[userLevel as keyof typeof HARDCODED_LESSONS] || HARDCODED_LESSONS.beginner)
        } else {
          setLessons(lessonsData)
        }

        // Load assignments (with error handling)
        try {
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
        } catch (error) {
          console.error('Error loading assignments:', error)
        }

        // Load progress (with error handling)
        try {
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
          console.error('Error loading progress:', error)
        }
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      // Fallback to hardcoded lessons
      setLessons(HARDCODED_LESSONS.beginner)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">🦜</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnSmart
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 font-medium">
                Dashboard
              </Link>
              {subscriptionStatus === 'free' && (
                <Link 
                  href="/payment"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-yellow-500 hover:to-orange-500"
                >
                  ⭐ Upgrade
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-700 font-medium">
                  {user?.user_metadata?.name || user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700"
                >
                  Sign Out
                </button>
              </div>
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

          {/* Join Class Section */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Join a Class</h2>
              <p className="text-gray-600">Enter a class code to join your teacher's class</p>
            </div>
            <JoinClassForm onJoined={loadUserData} />
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Lessons ({stats.level})</h2>
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

function JoinClassForm({ onJoined }: { onJoined: () => void }) {
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('code', classCode.toUpperCase())
        .single()

      if (classError || !classData) {
        throw new Error('Invalid class code')
      }

      // Check if already joined
      const { data: existing } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .single()

      if (existing) {
        throw new Error('You are already in this class')
      }

      // Get user name
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

      // Join class
      await supabase
        .from('class_students')
        .insert({
          class_id: classData.id,
          student_id: user.id,
          student_name: userData?.name || 'Student'
        })

      setSuccess(true)
      setClassCode('')
      setTimeout(() => {
        onJoined()
      }, 1500)
    } catch (error: any) {
      setError(error.message || 'Failed to join class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleJoinClass} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
          ✓ Successfully joined class!
        </div>
      )}
      <div className="flex gap-3">
        <input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800 font-mono text-center text-lg"
          placeholder="Enter Class Code (e.g., ABC123)"
          maxLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Class'}
        </button>
      </div>
    </form>
  )
}