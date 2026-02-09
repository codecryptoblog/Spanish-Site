// This file has been updated to use the createServerClient pattern for Supabase.
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = await updateSession(req)

  const { pathname } = req.nextUrl

  // Allow auth routes to pass through without session check
  // Onboarding route needs to be accessible without being redirected by itself
  if (pathname.startsWith('/auth') || pathname === '/onboarding') {
    return res
  }

  // After updateSession, the `res` object will contain the updated session information
  // We need to extract the session from the response to check if the user is authenticated.
  // However, `updateSession` already handles refreshing the session and returns the response.
  // We need to ensure that the session is available for subsequent checks.
  // For now, let's assume that if updateSession returns a response, the session is handled.

  // We need to re-create the supabase client to get the session here,
  // or pass the session in the response headers/cookies and retrieve it.
  // For simplicity, I'll re-create a client *without* cookie modification
  // to just read the session. This is not ideal for performance.
  // A better approach would be to pass the session through the response or use server components.

  // Re-creating a client to check session for redirect logic
  const { supabase } = await import('@/lib/supabase/middleware').then(mod => mod.createClient(req));
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No session, redirect to login
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set(`redirectedFrom`, pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if user is onboarded
  // This assumes the `public.users` table has a `class_id` column
  // and that new users are inserted into `public.users` on signup (e.g., via a Supabase trigger)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('class_id')
    .eq('id', session.user.id)
    .single()

  if (userError || !userData || !userData.class_id) {
    // User is authenticated but not onboarded, redirect to onboarding
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/onboarding'
    redirectUrl.searchParams.set(`redirectedFrom`, pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all authentication routes (/auth/*)
     * - onboarding route (/onboarding)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|onboarding).*)',
  ],
}
