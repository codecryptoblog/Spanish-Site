'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const plans = [
  {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '5 lessons per month',
      'Basic vocabulary',
      'Community support',
      'Mobile app access'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Pro',
    price: 12,
    interval: 'month',
    features: [
      'Unlimited lessons',
      'Advanced grammar',
      'AI conversation practice',
      'Priority support',
      'Offline mode',
      'Progress tracking'
    ],
    cta: 'Start Pro',
    popular: true
  },
  {
    name: 'Lifetime',
    price: 299,
    interval: 'once',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'All future features',
      '1-on-1 tutoring session',
      'Certificate of completion',
      'No recurring fees'
    ],
    cta: 'Get Lifetime Access',
    popular: false
  }
]

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState('Pro')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSelectPlan = async (planName: string) => {
    setSelectedPlan(planName)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Save plan selection
      await supabase
        .from('users')
        .update({ selected_plan: planName.toLowerCase() })
        .eq('id', user.id)

      // For now, just redirect to dashboard (payment integration comes later)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Mascot & Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">🦜</div>
          <div className="bg-white rounded-2xl p-6 shadow-lg inline-block mb-6">
            <p className="text-xl text-gray-700 font-medium">
              ¡Casi terminamos! Choose your learning plan 🚀
            </p>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-white/90">Start learning Spanish today!</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-4 ring-yellow-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 font-bold">
                  🌟 MOST POPULAR 🌟
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={loading && selectedPlan === plan.name}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {loading && selectedPlan === plan.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center text-white/90">
          <p className="text-sm mb-4">✓ 30-day money-back guarantee · ✓ Cancel anytime · ✓ Secure payment</p>
          <p className="text-xs">Payment integration coming soon. For now, selecting a plan will take you to the dashboard.</p>
        </div>
      </div>
    </div>
  )
}