'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export default function UpgradePage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          setError(error.message);
        } else if (data) {
          setUserProfile(data);
        }
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpgrade = async () => {
    setError(null);
    setSuccess(null);

    if (!userProfile?.id) {
      setError('User not logged in or profile not loaded.');
      return;
    }

    // Simulate upgrade by updating subscription_type
    const { error } = await supabase
      .from('users')
      .update({ subscription_type: 'premium' })
      .eq('id', userProfile.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Congratulations! You have been upgraded to Premium.');
      setUserProfile((prev) => prev ? { ...prev, subscription_type: 'premium' } : null);
      // Optionally redirect or refresh to apply changes
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Upgrade Your Account</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Free Version Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">Free Version</h2>
          <p className="text-gray-700 mb-4">
            Access to basic learning features.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Limited access to study materials</li>
            <li>Includes advertisements</li>
            <li>Standard leaderboard access</li>
          </ul>
          {userProfile?.subscription_type === 'free' ? (
            <button
              className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
              disabled
            >
              Current Plan
            </button>
          ) : (
            <button
              className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
              disabled
            >
              Selected
            </button>
          )}
        </div>

        {/* Premium Version Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-500">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Premium Version (for Schools)</h2>
          <p className="text-gray-700 mb-4">
            Unlock advanced features for a seamless learning experience.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Unlimited access to all study materials</li>
            <li>Ad-free experience</li>
            <li>Enhanced analytics and reporting for teachers</li>
            <li>Priority support</li>
          </ul>
          {userProfile?.subscription_type === 'premium' ? (
            <button
              className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
              disabled
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
