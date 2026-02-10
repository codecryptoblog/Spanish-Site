'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function TeacherSetup() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setupTeacherAccount()
  }, [])

  const setupTeacherAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Give teacher 30-day free trial
      const trialExpires = new Date()
      trialExpires.setDate(trialExpires.getDate() + 30)

      await supabase
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_expires_at: trialExpires.toISOString()
        })
        .eq('id', user.id)

      setTimeout(() => {
        router.push('/teacher')
      }, 2000)
    } catch (error) {
      console.error('Error setting up teacher:', error)
      router.push('/teacher')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-7xl mb-4 animate-bounce">👨‍🏫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Setting Up Your Account</h1>
        <p className="text-gray-600 mb-6">
          We're activating your 30-day free trial with full access to all teacher features!
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
      </div>
    </div>
  )
}