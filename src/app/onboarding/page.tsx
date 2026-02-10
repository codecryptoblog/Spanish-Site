'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const mascot = "🦜" // Parrot mascot for Spanish learning!

const questions = [
  {
    id: 1,
    question: "What do you want to learn in Spanish?",
    mascotMessage: "¡Hola! I'm Pedro the Parrot! Let's personalize your learning journey 🎉",
    emoji: "📚",
    options: [
      { value: 'conversation', label: 'Conversation', emoji: '💬', desc: 'Everyday speaking' },
      { value: 'business', label: 'Business Spanish', emoji: '💼', desc: 'Professional context' },
      { value: 'travel', label: 'Travel Phrases', emoji: '✈️', desc: 'Essential for trips' },
      { value: 'grammar', label: 'Grammar & Writing', emoji: '✍️', desc: 'Master the rules' }
    ]
  },
  {
    id: 2,
    question: "What's your current level?",
    mascotMessage: "Great choice! Now, where are you starting from? 🌟",
    emoji: "🎯",
    options: [
      { value: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just starting out' },
      { value: 'intermediate', label: 'Intermediate', emoji: '🌿', desc: 'Know the basics' },
      { value: 'advanced', label: 'Advanced', emoji: '🌳', desc: 'Pretty fluent' }
    ]
  },
  {
    id: 3,
    question: "Why are you learning Spanish?",
    mascotMessage: "Almost there! What's your motivation? 💭",
    emoji: "💡",
    options: [
      { value: 'travel', label: 'Travel', emoji: '🌎', desc: 'Explore the world' },
      { value: 'work', label: 'Career', emoji: '🚀', desc: 'Professional growth' },
      { value: 'family', label: 'Family/Friends', emoji: '❤️', desc: 'Connect with loved ones' },
      { value: 'fun', label: 'Personal interest', emoji: '✨', desc: 'Just for fun!' }
    ]
  },
  {
    id: 4,
    question: "How much time can you commit daily?",
    mascotMessage: "Perfect! Last question - how much time do you have? ⏰",
    emoji: "⏰",
    options: [
      { value: '5', label: '5 minutes', emoji: '⚡', desc: 'Quick daily boost' },
      { value: '15', label: '15 minutes', emoji: '🔥', desc: 'Solid practice' },
      { value: '30', label: '30+ minutes', emoji: '💪', desc: 'Deep learning' }
    ]
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [mascotAnimating, setMascotAnimating] = useState(false)
  const router = useRouter()

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setIsAnimating(true)
    setMascotAnimating(true)
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
        setTimeout(() => setMascotAnimating(false), 500)
      } else {
        // Save to localStorage and go to signup
        localStorage.setItem('onboarding_answers', JSON.stringify(newAnswers))
        router.push('/auth/signup')
      }
    }, 400)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-white/20 z-50">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl">
        {/* Mascot Speech Bubble */}
        <div className={`mb-6 transition-all duration-500 ${mascotAnimating ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative">
            <div className="absolute -bottom-3 left-12 w-6 h-6 bg-white transform rotate-45"></div>
            <p className="text-lg text-gray-700 font-medium">
              {currentQuestion.mascotMessage}
            </p>
          </div>
          <div className="ml-6 mt-2">
            <div className="text-7xl animate-bounce inline-block">
              {mascot}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div 
          className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Question Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {currentQuestion.emoji}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentQuestion.question}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 border-2 border-gray-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideIn 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{option.emoji}</span>
                  <div>
                    <div className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="mt-8 w-full text-gray-500 hover:text-gray-700 font-semibold py-3 transition-colors flex items-center justify-center gap-2"
            >
              <span>←</span> Back
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
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