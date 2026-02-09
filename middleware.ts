import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types' // Import the Database type

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Use the Database type here
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Allow auth routes to pass through without session check
  // Onboarding route needs to be accessible without being redirected by itself
  if (pathname.startsWith('/auth') || pathname === '/onboarding') {
    return res
  }

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
