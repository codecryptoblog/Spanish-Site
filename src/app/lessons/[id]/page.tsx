'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function TakeLesson() {
  const [lesson, setLesson] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadLesson()
  }, [])

  const loadLesson = async () => {
    try {
      const lessonId = params.id as string

      // Load lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      setLesson(lessonData)

      // Load questions
      const { data: questionsData } = await supabase
        .from('lesson_content')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true })

      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error loading lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.correct_answer

    setIsCorrect(correct)
    setShowExplanation(true)

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (correct) {
      setScore(score + currentQuestion.points)
    }
  }

  const handleNextQuestion = async () => {
    setShowExplanation(false)
    setSelectedAnswer(null)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Lesson completed
      await saveProgress()
      setCompleted(true)
    }
  }

  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

      await supabase
        .from('lesson_progress')
        .upsert({
          student_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          score,
          max_score: maxScore,
          completed_at: new Date().toISOString()
        })

      // Check if this is part of an assignment
      const { data: assignmentSub } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id')
        .eq('student_id', user.id)
        .eq('completed', false)
        .limit(1)
        .single()

      if (assignmentSub) {
        await supabase
          .from('assignment_submissions')
          .update({
            completed: true,
            score: Math.round((score / maxScore) * 100),
            submitted_at: new Date().toISOString()
          })
          .eq('id', assignmentSub.id)
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  if (completed) {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-7xl mb-4">
            {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Lesson Complete!</h1>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-700 mb-2">Your Score</p>
            <p className="text-6xl font-bold text-purple-600">{percentage}%</p>
            <p className="text-gray-600 mt-2">{score} out of {maxScore} points</p>
          </div>

          {percentage >= 90 ? (
            <p className="text-xl text-gray-700 mb-8">
              ¡Excelente! Outstanding work! 🌟
            </p>
          ) : percentage >= 70 ? (
            <p className="text-xl text-gray-700 mb-8">
              ¡Muy bien! Great job! Keep it up! 📚
            </p>
          ) : (
            <p className="text-xl text-gray-700 mb-8">
              Good effort! Review the material and try again. 💪
            </p>
          )}

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Back to Dashboard
            </Link>
            {percentage < 80 && (
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
              >
                Retake Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-sm text-purple-600 font-semibold mt-2">
            Current Score: {score} points
          </p>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h2>
          
          {currentQuestion.type === 'multiple_choice' ? (
            <div className="space-y-3">
              {JSON.parse(currentQuestion.options || '[]').map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => !showExplanation && handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showExplanation
                      ? option === currentQuestion.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : option === selectedAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                      : selectedAnswer === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="font-medium text-gray-800">{option}</span>
                  {showExplanation && option === currentQuestion.correct_answer && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                  {showExplanation && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                    <span className="ml-2 text-red-600">✗</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showExplanation}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
              placeholder="Type your answer..."
            />
          )}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-xl p-4 mb-6 border-2 ${
            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '¡Correcto! ✓' : 'Incorrect ✗'}
            </p>
            {currentQuestion.explanation && (
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            )}
            {!isCorrect && (
              <p className="text-gray-700 mt-2">
                Correct answer: <strong>{currentQuestion.correct_answer}</strong>
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        {showExplanation ? (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Complete Lesson'}
          </button>
        ) : (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  )
}