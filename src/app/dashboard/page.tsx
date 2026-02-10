'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    level: 'Beginner'
  })
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
      
      // Load user stats from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user profile:', userError)
      }

      if (userData) {
        setStats({
          lessonsCompleted: userData.lessons_completed || 0,
          currentStreak: userData.current_streak || 0,
          totalPoints: userData.total_points || 0,
          level: user.user_metadata?.onboarding_data?.[2] || 'Beginner'
        })
      }
      
    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleStartLesson = () => {
    alert('Starting lesson!')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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
              <span className="text-sm text-gray-700 font-medium">
                {user?.user_metadata?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
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
              </div>
              <div className="text-7xl animate-bounce">
                🦜
              </div>
            </div>
          </div>

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
              <div className="text-xl font-bold text-gray-800">{stats.level}</div>
              <div className="text-gray-600">Current Level</div>
            </div>
          </div>

          {/* Today's Lesson */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Lesson</h2>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">📖</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Greetings & Introductions</h3>
                  <p className="text-gray-600">Learn how to introduce yourself in Spanish</p>
                </div>
              </div>
              <button 
                onClick={handleStartLesson}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
                Start Lesson →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <button className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600">Practice Speaking</h3>
              <p className="text-gray-600 text-sm">AI conversation partner</p>
            </button>
            
            <button className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600">Vocabulary Review</h3>
              <p className="text-gray-600 text-sm">Flashcards & quizzes</p>
            </button>
            
            <button className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600">Learning Games</h3>
              <p className="text-gray-600 text-sm">Fun mini-games</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

