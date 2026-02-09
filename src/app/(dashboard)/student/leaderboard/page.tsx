'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import AdPlaceholder from '@/components/AdPlaceholder'; // Import AdPlaceholder

type LeaderboardEntry = {
  user_id: string;
  score: number;
  users: { // Assuming 'users' relationship is automatically joined
    full_name: string | null;
  } | null;
};

export default function StudentLeaderboardPage() {
  const [userRole, setUserRole] = useState<Database['public']['Enums']['user_role'] | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<Database['public']['Enums']['subscription_type'] | null>(null); // New state for subscription type
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUserRoleAndFetchLeaderboard() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, class_id, subscription_type') // Select subscription_type
        .eq('id', session.user.id)
        .single();

      if (userError || !userData || userData.role !== 'student') {
        setError('Access Denied: Only students can view the leaderboard.');
        setLoading(false);
        // Optionally redirect non-students
        // router.push('/');
        return;
      }
      setUserRole(userData.role);
      setSubscriptionType(userData.subscription_type); // Set subscription type

      // Fetch leaderboard data, joining with users table to get full_name
      // For a Duolingo-style leaderboard, we might want to filter by class_id later
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('*, users(full_name)')
        .order('score', { ascending: false });

      if (leaderboardError) {
        setError(leaderboardError.message);
      } else {
        setLeaderboard(leaderboardData || []);
      }
      setLoading(false);
    }

    checkUserRoleAndFetchLeaderboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading leaderboard...</p>
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {subscriptionType === 'free' && <AdPlaceholder />} {/* Ad Placeholder */}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {leaderboard.length === 0 ? (
          <p>No students on the leaderboard yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <li key={entry.user_id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl font-bold mr-4 w-8 text-center">{index + 1}.</span>
                  <span className="text-lg">{entry.users?.full_name || 'Anonymous User'}</span>
                </div>
                <span className="text-lg font-semibold">{entry.score} points</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}