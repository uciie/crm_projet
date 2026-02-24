import { createServerClient }        from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

// ── Public routes (no authentication required) ────────────────

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/auth/forgot-password',
  '/auth/update-password',
  '/auth/callback',
]

// ── Middleware ────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Initialize Supabase server client with cookie handling.
  // This also refreshes the session automatically (required for SSR).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT server-side (not just cookie).
  // This is the only secure way to check auth in middleware.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname    = request.nextUrl.pathname
  const isPublic    = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const isAuthPage  = ['/login', '/register'].some(p => pathname.startsWith(p))

  // Unauthenticated user trying to access protected route
  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access login/register
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}