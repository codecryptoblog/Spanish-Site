'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];

export default function TeacherSubjectsPage() {
  const [userRole, setUserRole] = useState<Database['public']['Enums']['user_role'] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUserRoleAndFetchSubjects() {
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
        setError('Access Denied: Only teachers can manage subjects.');
        setLoading(false);
        // Optionally redirect non-teachers
        // router.push('/');
        return;
      }

      setUserRole(userData.role);
      
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (subjectsError) {
        setError(subjectsError.message);
      } else {
        setSubjects(subjectsData || []);
      }
      setLoading(false);
    }

    checkUserRoleAndFetchSubjects();
  }, [router]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newSubjectName.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }

    const { data, error: insertError } = await supabase
      .from('subjects')
      .insert({ name: newSubjectName.trim() })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setSubjects([...subjects, data]);
      setNewSubjectName('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading subjects...</p>
      </div>
    );
  }

  if (error && error.includes('Access Denied')) {
    return (
      <div className="container mx-auto p-4 text-red-500 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>{error}</p>
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
      <h1 className="text-3xl font-bold mb-6">Manage Subjects</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Subject</h2>
        <form onSubmit={handleAddSubject} className="flex gap-4">
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="New Subject Name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Subject
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Subjects</h2>
        {subjects.length === 0 ? (
          <p>No subjects added yet.</p>
        ) : (
          <ul>
            {subjects.map((subject) => (
              <li key={subject.id} className="border-b py-2 flex justify-between items-center">
                <span>{subject.name}</span>
                {/* Add edit/delete functionality later */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
