'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type SubscriptionType = Database['public']['Enums']['subscription_type']; // New type

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(null); // New state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('role, class_id, subscription_type') // Select subscription_type
        .eq('id', session.user.id)
        .single();

      if (userFetchError || !userData) {
        // User not in public.users table or some error, redirect to onboarding
        router.push('/onboarding');
        return;
      }

      if (!userData.class_id) {
        // Authenticated but not onboarded
        router.push('/onboarding');
        return;
      }

      setUser(session.user);
      setUserRole(userData.role);
      setSubscriptionType(userData.subscription_type); // Set subscription type
      setLoading(false);
    };

    getUserSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">EduPlatform</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block py-2 px-3 rounded hover:bg-gray-700">
                Home
              </Link>
            </li>
            {userRole === 'teacher' && (
              <>
                <li>
                  <Link href="/teacher/lesson-plans" className="block py-2 px-3 rounded hover:bg-gray-700">
                    Lesson Plans
                  </Link>
                </li>
                <li>
                  <Link href="/teacher/assignments" className="block py-2 px-3 rounded hover:bg-gray-700">
                    Assignments
                  </Link>
                </li>
                <li>
                  <Link href="/teacher/subjects" className="block py-2 px-3 rounded hover:bg-gray-700">
                    Subjects
                  </Link>
                </li>
              </>
            )}
            {userRole === 'student' && (
              <>
                <li>
                  <Link href="/student/leaderboard" className="block py-2 px-3 rounded hover:bg-gray-700">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/student/self-study" className="block py-2 px-3 rounded hover:bg-gray-700">
                    Self-Study
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link href="/settings" className="block py-2 px-3 rounded hover:bg-gray-700">
                Settings
              </Link>
            </li>
            {subscriptionType === 'free' && ( // Only show upgrade link if free
                <li>
                <Link href="/upgrade" className="block py-2 px-3 rounded bg-yellow-500 text-black hover:bg-yellow-600">
                    Upgrade to Premium!
                </Link>
                </li>
            )}
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}