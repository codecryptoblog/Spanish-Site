'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const questions = [
  {
    id: 1,
    question: "What's your current Spanish level?",
    emoji: "🎯",
    options: [
      { value: 'beginner', label: 'Beginner', emoji: '🌱' },
      { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
      { value: 'advanced', label: 'Advanced', emoji: '🌳' }
    ]
  },
  {
    id: 2,
    question: "Why do you want to learn Spanish?",
    emoji: "💭",
    options: [
      { value: 'travel', label: 'Travel', emoji: '✈️' },
      { value: 'work', label: 'Work/Career', emoji: '💼' },
      { value: 'family', label: 'Family/Friends', emoji: '👨‍👩‍👧' },
      { value: 'fun', label: 'Just for fun!', emoji: '🎉' }
    ]
  },
  {
    id: 3,
    question: "How much time can you dedicate daily?",
    emoji: "⏰",
    options: [
      { value: '5', label: '5 minutes', emoji: '⚡' },
      { value: '15', label: '15 minutes', emoji: '🔥' },
      { value: '30', label: '30+ minutes', emoji: '💪' }
    ]
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = async (value: string) => {
    setIsAnimating(true)
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      } else {
        // Save preferences and redirect
        completeOnboarding(newAnswers)
      }
    }, 300)
  }

  const completeOnboarding = async (finalAnswers: Record<number, string>) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            level: finalAnswers[1],
            goal: finalAnswers[2],
            daily_time: parseInt(finalAnswers[3]),
            onboarding_completed: true
          })
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md">
        <div 
          className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Emoji Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">
              {currentQuestion.emoji}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentQuestion.question}
            </h2>
            <p className="text-sm text-gray-500">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 border-2 border-gray-200 hover:border-purple-400 rounded-2xl p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideIn 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-600">
                    {option.label}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="mt-6 w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Fun Motivational Text */}
        <div className="text-center mt-6 text-white/90 font-medium">
          <p className="text-sm">
            {currentStep === 0 && "¡Vamos! Let's personalize your journey 🚀"}
            {currentStep === 1 && "Great choice! You're doing amazing 🌟"}
            {currentStep === 2 && "Almost there! One more question ✨"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}