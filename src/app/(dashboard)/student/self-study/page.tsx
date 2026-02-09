'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import AdPlaceholder from '@/components/AdPlaceholder'; // Import AdPlaceholder

type Lesson = Database['public']['Tables']['lessons']['Row'];
type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];

export default function StudentSelfStudyPage() {
  const [userRole, setUserRole] = useState<Database['public']['Enums']['user_role'] | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<Database['public']['Enums']['subscription_type'] | null>(null); // New state for subscription type
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchLessonsAndQuestions = useCallback(async (sessionUserId: string) => {
    // Fetch user role and subscription_type
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, class_id, subscription_type') // Select subscription_type
      .eq('id', sessionUserId)
      .single();

    if (userError || !userData || userData.role !== 'student') {
      setError('Access Denied: Only students can access self-study.');
      setLoading(false);
      // router.push('/'); // Optionally redirect non-students
      return;
    }
    setUserRole(userData.role);
    setSubscriptionType(userData.subscription_type); // Set subscription type

    // Fetch lessons (for now, all lessons)
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .order('title', { ascending: true });

    if (lessonsError) {
      setError(lessonsError.message);
    } else {
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0 && !selectedLessonId) {
        setSelectedLessonId(lessonsData[0].id); // Select first lesson by default
      }
    }
    setLoading(false);
  }, [selectedLessonId]);

  useEffect(() => {
    async function getUserSession() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }
      fetchLessonsAndQuestions(session.user.id);
    }
    getUserSession();
  }, [router, fetchLessonsAndQuestions]);


  useEffect(() => {
    async function fetchQuestionsForSelectedLesson() {
      if (selectedLessonId) {
        const { data, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('lesson_id', selectedLessonId)
          .order('id', { ascending: true }); // Order for consistent flashcard sequence

        if (questionsError) {
          setError(questionsError.message);
        } else {
          setQuizQuestions(data || []);
          setCurrentQuestionIndex(0);
          setShowAnswer(false);
        }
      } else {
        setQuizQuestions([]);
      }
    }
    fetchQuestionsForSelectedLesson();
  }, [selectedLessonId]);

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % quizQuestions.length);
  };

  const handlePrevQuestion = () => {
    setShowAnswer(false);
    setCurrentQuestionIndex((prevIndex) => (prevIndex - 1 + quizQuestions.length) % quizQuestions.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading self-study...</p>
      </div>
    );
  }

  if (userRole !== 'student') {
      return (
          <div className="container mx-auto p-4 text-red-500 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You must be a student to access this page.</p>
          </div>
      );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Self-Study</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {subscriptionType === 'free' && <AdPlaceholder />} {/* Ad Placeholder */}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Select a Lesson</h2>
        <select
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedLessonId || ''}
          onChange={(e) => setSelectedLessonId(e.target.value)}
        >
          <option value="">-- Select a Lesson --</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {selectedLessonId && quizQuestions.length > 0 && currentQuestion ? (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
          <p className="text-sm text-gray-500 mb-2">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
          <div className="min-h-[150px] flex items-center justify-center border border-gray-300 rounded p-4 mb-4">
            <p className="text-xl font-semibold">{showAnswer ? currentQuestion.answer : currentQuestion.question}</p>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={quizQuestions.length <= 1}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={quizQuestions.length <= 1}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : selectedLessonId && !currentQuestion && !loading && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
          <p className="text-xl">No quiz questions for this lesson yet.</p>
        </div>
      )}
      {
          !selectedLessonId && !loading && (
              <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
                  <p className="text-xl">Please select a lesson to start self-study.</p>
              </div>
          )
      }
    </div>
  );
}