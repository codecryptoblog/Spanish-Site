'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssignments: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTeacherData()
  }, [])

  const loadTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is teacher
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'teacher' && userData?.role !== 'school_admin') {
        router.push('/dashboard')
        return
      }

      setUser(user)

      // Load classes
      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          *,
          class_students (count)
        `)
        .eq('teacher_id', user.id)

      setClasses(classesData || [])

      // Calculate stats
      const totalStudents = classesData?.reduce((sum, cls) => sum + (cls.class_students?.[0]?.count || 0), 0) || 0
      
      setStats({
        totalClasses: classesData?.length || 0,
        totalStudents,
        pendingAssignments: 0 // We'll calculate this later
      })

    } catch (error) {
      console.error('Error loading teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
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
              <span className="text-3xl">👨‍🏫</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Teacher Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/teacher/lessons" className="text-gray-700 hover:text-purple-600 font-medium">
                Lessons
              </Link>
              <Link href="/teacher/assignments" className="text-gray-700 hover:text-purple-600 font-medium">
                Assignments
              </Link>
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
          {/* Welcome */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.name}! 👋
            </h1>
            <p className="text-xl text-white/90">Manage your classes and track student progress</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">🏫</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalClasses}</div>
              <div className="text-gray-600">Active Classes</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalStudents}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-gray-800">{stats.pendingAssignments}</div>
              <div className="text-gray-600">To Grade</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/teacher/classes/create"
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">➕</div>
                <h3 className="font-bold text-gray-800 group-hover:text-purple-600">Create Class</h3>
                <p className="text-sm text-gray-600">Set up a new class</p>
              </Link>

              <Link
                href="/teacher/lessons/create"
                className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600">Create Lesson</h3>
                <p className="text-sm text-gray-600">Build custom content</p>
              </Link>

              <Link
                href="/teacher/assignments/create"
                className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="font-bold text-gray-800 group-hover:text-green-600">Assign Work</h3>
                <p className="text-sm text-gray-600">Give homework</p>
              </Link>

              <Link
                href="/teacher/grades"
                className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-800 group-hover:text-orange-600">Grade Work</h3>
                <p className="text-sm text-gray-600">Review submissions</p>
              </Link>
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
              <Link
                href="/teacher/classes/create"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                + New Class
              </Link>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏫</div>
                <p className="text-gray-600 mb-4">No classes yet</p>
                <Link
                  href="/teacher/classes/create"
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  Create your first class →
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/teacher/classes/${cls.id}`}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {cls.code}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{cls.grade_level}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-2xl">👥</span>
                      <span className="font-medium">
                        {cls.class_students?.[0]?.count || 0} students
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}