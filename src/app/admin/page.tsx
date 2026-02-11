'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSchools: 0,
    paidUsers: 0,
    revenue: 0
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Load stats
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: totalTeachers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')

      const { count: totalStudents } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      const { count: paidUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('subscription_status', ['pro', 'lifetime'])

      setStats({
        totalUsers: totalUsers || 0,
        totalTeachers: totalTeachers || 0,
        totalStudents: totalStudents || 0,
        totalSchools: 0,
        paidUsers: paidUsers || 0,
        revenue: (paidUsers || 0) * 12
      })

      // Load recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentUsers(users || [])

    } catch (error) {
      console.error('Error loading admin data:', error)
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
<nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <Link href="/admin" className="flex items-center gap-2">
        <span className="text-3xl">⚙️</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Admin Panel
        </span>
      </Link>
      <div className="flex items-center gap-2">
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
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard 👑</h1>
            <p className="text-xl text-white/90">System overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
              <div className="text-gray-600">Total Users</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalTeachers}</div>
              <div className="text-gray-600">Teachers</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">🎓</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalStudents}</div>
              <div className="text-gray-600">Students</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">🏫</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalSchools}</div>
              <div className="text-gray-600">Schools</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-gray-800">{stats.paidUsers}</div>
              <div className="text-gray-600">Paid Users</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-2xl font-bold text-gray-800">${stats.revenue}</div>
              <div className="text-gray-600">MRR</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-gray-800 group-hover:text-purple-600">Manage Users</h3>
              </Link>

              <Link
                href="/admin/schools"
                className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">🏫</div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600">Schools</h3>
              </Link>

              <Link
                href="/admin/content"
                className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-gray-800 group-hover:text-green-600">Content</h3>
              </Link>

              <Link
                href="/admin/analytics"
                className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-800 group-hover:text-orange-600">Analytics</h3>
              </Link>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.subscription_status === 'pro' || user.subscription_status === 'lifetime' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.subscription_status || 'free'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}