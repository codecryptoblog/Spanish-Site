'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Onboarding() {
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
        // Check if user already has a class_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('class_id')
          .eq('id', user.id)
          .single();

        if (userData?.class_id) {
          router.push('/'); // Already onboarded, redirect to home
        }
      }
    };
    getUser();
  }, [router]);

  const handleClassCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('User not found. Please log in again.');
      router.push('/auth/login');
      return;
    }

    // 1. Verify class code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('class_code', classCode)
      .single();

    if (classError || !classData) {
      setError('Invalid class code. Please try again.');
      return;
    }

    const classId = classData.id;

    // 2. Insert or update user in the public.users table
    // For now, we'll assume a user record exists or can be created.
    // In a real app, this might be handled by a Supabase function on new user signup.
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({ id: user.id, class_id: classId, full_name: user.user_metadata.full_name || user.email })
      .eq('id', user.id);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push('/'); // Onboarding complete, redirect to home
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Enter Class Code</h2>
        <p className="text-center text-gray-600 mb-6">
          Welcome! Please enter your class code to get started.
        </p>
        <form onSubmit={handleClassCodeSubmit}>
          <div className="mb-4">
            <label htmlFor="classCode" className="block text-gray-700 text-sm font-bold mb-2">
              Class Code:
            </label>
            <input
              type="text"
              id="classCode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
