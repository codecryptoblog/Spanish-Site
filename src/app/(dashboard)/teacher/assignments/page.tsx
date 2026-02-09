'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

export default function TeacherAssignmentsPage() {
  const [userRole, setUserRole] = useState<Database['public']['Enums']['user_role'] | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
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
        setError('Access Denied: Only teachers can manage assignments.');
        setLoading(false);
        // Optionally redirect non-teachers
        // router.push('/');
        return;
      }

      setUserRole(userData.role);
      
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('title', { ascending: true });

      if (lessonsError) {
        setError(lessonsError.message);
      } else {
        setLessons(lessonsData || []);
        if (lessonsData && lessonsData.length > 0) {
            setSelectedLessonId(lessonsData[0].id); // Select first lesson by default
        }
      }

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, lessons(title)') // Join with lessons table to get lesson title
        .order('due_date', { ascending: true });

      if (assignmentsError) {
        setError(assignmentsError.message);
      } else {
        setAssignments(assignmentsData || []);
      }
      setLoading(false);
    }

    checkUserRoleAndFetchData();
  }, [router]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newAssignmentTitle.trim() || !selectedLessonId || !dueDate) {
      setError('Assignment title, lesson, and due date are required.');
      return;
    }

    const { data, error: insertError } = await supabase
      .from('assignments')
      .insert({ 
          title: newAssignmentTitle.trim(), 
          lesson_id: selectedLessonId,
          due_date: new Date(dueDate).toISOString()
        })
      .select('*, lessons(title)') // Select with lesson title for immediate display
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setAssignments([...assignments, data]);
      setNewAssignmentTitle('');
      setDueDate('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading assignments...</p>
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
      <h1 className="text-3xl font-bold mb-6">Manage Assignments</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Assignment</h2>
        <form onSubmit={handleAddAssignment}>
          <div className="mb-4">
            <label htmlFor="assignmentTitle" className="block text-gray-700 text-sm font-bold mb-2">
              Assignment Title:
            </label>
            <input
              type="text"
              id="assignmentTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Assignment Title"
              value={newAssignmentTitle}
              onChange={(e) => setNewAssignmentTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lesson" className="block text-gray-700 text-sm font-bold mb-2">
              Lesson:
            </label>
            <select
              id="lesson"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedLessonId || ''}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              required
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">
              Due Date:
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Assignment
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Assignments</h2>
        {assignments.length === 0 ? (
          <p>No assignments added yet.</p>
        ) : (
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment.id} className="border-b py-2 flex justify-between items-center">
                <span>{assignment.title} (Lesson: {(assignment as any).lessons?.title || 'N/A'}) - Due: {new Date(assignment.due_date!).toLocaleString()}</span>
                {/* Add edit/delete functionality later */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
