'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

export default function TeacherLessonPlansPage() {
  const [userRole, setUserRole] = useState<Database['public']['Enums']['user_role'] | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUserRoleAndFetchData() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData || userData.role !== 'teacher') {
        setError('Access Denied: Only teachers can manage lesson plans.');
        setLoading(false);
        // Optionally redirect non-teachers
        // router.push('/');
        return;
      }

      setUserRole(userData.role);
      
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (subjectsError) {
        setError(subjectsError.message);
      } else {
        setSubjects(subjectsData || []);
        if (subjectsData && subjectsData.length > 0) {
            setSelectedSubjectId(subjectsData[0].id); // Select first subject by default
        }
      }

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*, subjects(name)') // Join with subjects table to get subject name
        .order('title', { ascending: true });

      if (lessonsError) {
        setError(lessonsError.message);
      } else {
        setLessons(lessonsData || []);
      }
      setLoading(false);
    }

    checkUserRoleAndFetchData();
  }, [router]);

  const handleAddLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newLessonTitle.trim() || !selectedSubjectId) {
      setError('Lesson title and subject are required.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('User not authenticated.');
        return;
    }

    const { data, error: insertError } = await supabase
      .from('lessons')
      .insert({ 
          title: newLessonTitle.trim(), 
          subject_id: selectedSubjectId,
          created_by: user.id
        })
      .select('*, subjects(name)') // Select with subject name for immediate display
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setLessons([...lessons, data]);
      setNewLessonTitle('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading lesson plans...</p>
      </div>
    );
  }

  if (userRole !== 'teacher') {
      return (
          <div className="container mx-auto p-4 text-red-500 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You must be a teacher to access this page.</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Lesson Plans</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Lesson Plan</h2>
        <form onSubmit={handleAddLessonPlan}>
          <div className="mb-4">
            <label htmlFor="lessonTitle" className="block text-gray-700 text-sm font-bold mb-2">
              Lesson Title:
            </label>
            <input
              type="text"
              id="lessonTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Lesson Title"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">
              Subject:
            </label>
            <select
              id="subject"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              required
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Lesson Plan
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Lesson Plans</h2>
        {lessons.length === 0 ? (
          <p>No lesson plans added yet.</p>
        ) : (
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson.id} className="border-b py-2 flex justify-between items-center">
                <span>{lesson.title} (Subject: {(lesson as any).subjects?.name || 'N/A'})</span>
                {/* Add edit/delete functionality later */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
