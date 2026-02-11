'use client';

import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    // Assuming 'role' could be part of user_metadata or directly on the user object
    role?: string; 
  };
}

export default function TeacherPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Optional: Check for a specific 'teacher' role if your application uses roles
        // if (user.user_metadata?.role !== 'teacher') {
        //   router.push('/dashboard'); // Redirect if not a teacher
        //   return;
        // }

        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Teacher Dashboard</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">Welcome, {user?.user_metadata?.name || user?.email}!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Class Management */}
            <DashboardCard 
              title="Class Management" 
              description="View, create, and manage your classes." 
              link="/teacher/classes" 
              linkText="Manage Classes"
            />

            {/* Create New Class */}
            <DashboardCard 
              title="Create New Class" 
              description="Set up a new class for your students." 
              link="/teacher/classes/create" 
              linkText="Create Class"
            />

            {/* Assignment Management */}
            <DashboardCard 
              title="Assignments" 
              description="Create and review student assignments." 
              link="/teacher/assignments" 
              linkText="View Assignments"
            />

            {/* Create New Lesson */}
            <DashboardCard 
              title="Create New Lesson" 
              description="Design and publish new lessons for your curriculum." 
              link="/teacher/lessons/create" 
              linkText="Create Lesson"
            />

            {/* Teacher Setup */}
            <DashboardCard 
              title="Initial Setup" 
              description="Complete your teacher profile and settings." 
              link="/teacher/setup" 
              linkText="Go to Setup"
            />

            {/* Additional Features (Placeholder) */}
            <DashboardCard 
              title="Student Progress" 
              description="Monitor individual student and class performance." 
              link="#" 
              linkText="View Progress"
              isPlaceholder={true}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
  isPlaceholder?: boolean;
}

function DashboardCard({ title, description, link, linkText, isPlaceholder = false }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 ${isPlaceholder ? 'opacity-70 grayscale' : ''}`}>
      <h2 className="text-2xl font-semibold text-purple-700 mb-3">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={link} className={`inline-block ${isPlaceholder ? 'pointer-events-none' : ''}`}>
        <button className={`px-5 py-2 rounded-lg text-white font-medium transition-all ${isPlaceholder ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}>
          {linkText}
        </button>
      </Link>
    </div>
  );
}