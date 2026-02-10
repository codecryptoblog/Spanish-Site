'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const placementQuestions = [
  {
    question: 'How do you say "Hello, how are you?" in Spanish?',
    options: ['Hola, ¿cómo estás?', 'Adiós, gracias', 'Buenos días, por favor', 'Mucho gusto'],
    correct: 0,
    level: 'beginner'
  },
  {
    question: 'Choose the correct form: Yo ___ estudiante.',
    options: ['soy', 'eres', 'es', 'son'],
    correct: 0,
    level: 'beginner'
  },
  {
    question: 'What is "the book" in Spanish?',
    options: ['la libro', 'el libro', 'los libro', 'las libro'],
    correct: 1,
    level: 'beginner'
  },
  {
    question: 'Complete: Ayer yo ___ al cine. (I went to the cinema yesterday)',
    options: ['voy', 'fui', 'iré', 'vaya'],
    correct: 1,
    level: 'intermediate'
  },
  {
    question: 'Which sentence is correct?',
    options: [
      'Ella es más alta que yo',
      'Ella es más alto que yo',
      'Ella es mas alta de yo',
      'Ella es alto más que yo'
    ],
    correct: 0,
    level: 'intermediate'
  },
  {
    question: 'Complete: Cuando era niño, ___ en el parque. (When I was a child, I used to play in the park)',
    options: ['juego', 'jugué', 'jugaba', 'jugaré'],
    correct: 2,
    level: 'intermediate'
  },
  {
    question: 'Choose the correct subjunctive: Es importante que tú ___ bien.',
    options: ['comes', 'comas', 'comerás', 'comiste'],
    correct: 1,
    level: 'advanced'
  },
  {
    question: 'What\'s the difference between "por" and "para" in: Trabajo ___ mi familia?',
    options: ['por (for the sake of)', 'para (in order to)', 'Both work', 'Neither works'],
    correct: 0,
    level: 'advanced'
  },
  {
    question: 'Complete with past subjunctive: Si yo ___ rico, viajaría mucho.',
    options: ['soy', 'era', 'fuera', 'seré'],
    correct: 2,
    level: 'advanced'
  },
  {
    question: 'What does this idiom mean: "No tener pelos en la lengua"?',
    options: [
      'To not have hair on your tongue',
      'To speak directly/bluntly',
      'To be very quiet',
      'To be hairy'
    ],
    correct: 1,
    level: 'advanced'
  }
]

export default function PlacementTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [determinedLevel, setDeterminedLevel] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)
    setSelectedAnswer(null)

    if (currentQuestion < placementQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateLevel(newAnswers)
    }
  }

  const calculateLevel = async (finalAnswers: number[]) => {
    let beginnerScore = 0
    let intermediateScore = 0
    let advancedScore = 0

    finalAnswers.forEach((answer, index) => {
      if (answer === placementQuestions[index].correct) {
        if (placementQuestions[index].level === 'beginner') beginnerScore++
        if (placementQuestions[index].level === 'intermediate') intermediateScore++
        if (placementQuestions[index].level === 'advanced') advancedScore++
      }
    })

    let level = 'beginner'
    if (beginnerScore >= 2 && intermediateScore >= 2) {
      level = 'intermediate'
    }
    if (intermediateScore >= 2 && advancedScore >= 2) {
      level = 'advanced'
    }

    setDeterminedLevel(level)
    setShowResult(true)

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').update({
          spanish_level: level
        }).eq('id', user.id)
      }
    } catch (error) {
      console.error('Error saving level:', error)
    }
  }

  const handleContinue = () => {
    router.push('/payment')
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Assessment Complete!</h1>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-700 mb-2">Your Spanish Level:</p>
            <p className="text-5xl font-bold text-purple-600 capitalize">{determinedLevel}</p>
          </div>
          <p className="text-gray-600 mb-8">
            We've personalized your learning path based on your current level. 
            You'll start with {determinedLevel}-level lessons and can progress at your own pace!
          </p>
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    )
  }

  const question = placementQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / placementQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-white/20 z-50">
        <div 
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mt-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Placement Assessment</h1>
          <p className="text-gray-600">Question {currentQuestion + 1} of {placementQuestions.length}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <span className="font-medium text-gray-800">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnswer}
          disabled={selectedAnswer === null}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {currentQuestion < placementQuestions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      </div>
    </div>
  )
}