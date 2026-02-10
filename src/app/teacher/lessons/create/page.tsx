'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type QuestionType = 'multiple_choice' | 'fill_blank' | 'matching'

interface Question {
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

export default function CreateLesson() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('beginner')
  const [category, setCategory] = useState('vocabulary')
  const [questions, setQuestions] = useState<Question[]>([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    type: 'multiple_choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 10
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      alert('Please fill in question and correct answer')
      return
    }

    setQuestions([...questions, currentQuestion])
    setCurrentQuestion({
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 10
    })
    setShowQuestionForm(false)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (questions.length === 0) {
      setError('Please add at least one question')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user's school_id
      const { data: userData } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', user.id)
        .single()

      // Create lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          title,
          description,
          level,
          category,
          is_default: false,
          created_by: user.id,
          school_id: userData?.school_id
        })
        .select()
        .single()

      if (lessonError) throw lessonError

      // Add questions
      const questionInserts = questions.map((q, index) => ({
        lesson_id: lessonData.id,
        type: q.type,
        question: q.question,
        options: q.type === 'multiple_choice' ? JSON.stringify(q.options) : null,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        order_index: index + 1,
        points: q.points
      }))

      const { error: questionsError } = await supabase
        .from('lesson_content')
        .insert(questionInserts)

      if (questionsError) throw questionsError

      router.push('/teacher/lessons')
    } catch (error: any) {
      setError(error.message || 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/teacher" className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Custom Lesson</h1>
            <p className="text-gray-600">Build your own interactive Spanish lesson</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                  placeholder="e.g., Ordering Food at a Restaurant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                  rows={3}
                  placeholder="Brief description of what students will learn"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                  >
                    <option value="vocabulary">Vocabulary</option>
                    <option value="grammar">Grammar</option>
                    <option value="conversation">Conversation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Questions ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                >
                  + Add Question
                </button>
              </div>

              {questions.length > 0 && (
                <div className="space-y-3 mb-6">
                  {questions.map((q, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                              {q.type.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500 text-sm">{q.points} points</span>
                          </div>
                          <p className="font-medium text-gray-800">{q.question}</p>
                          {q.type === 'multiple_choice' && (
                            <ul className="mt-2 space-y-1">
                              {q.options?.map((opt, i) => (
                                <li key={i} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                  {opt === q.correctAnswer && '✓ '}{opt}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700 font-medium ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question Form */}
              {showQuestionForm && (
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value as QuestionType})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="matching">Matching</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800"
                      placeholder="Type your question here"
                    />
                  </div>

                  {currentQuestion.type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options?.map((opt, i) => (
                          <input
                            key={i}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...(currentQuestion.options || [])]
                              newOptions[i] = e.target.value
                              setCurrentQuestion({...currentQuestion, options: newOptions})
                            }}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-800"
                            placeholder={`Option ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    {currentQuestion.type === 'multiple_choice' ? (
                      <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options?.filter(opt => opt).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800"
                        placeholder="Type the correct answer"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Explanation (optional)
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800"
                      placeholder="Why is this the correct answer?"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700"
                    >
                      Add Question
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuestionForm(false)}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || questions.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating Lesson...' : 'Create Lesson'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}