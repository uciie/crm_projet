import { NextResponse }                 from 'next/server'
import { createServerSupabaseClient }  from '@/lib/supabase/server'

// Handles the redirect from Supabase after email confirmation or password reset
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code                     = searchParams.get('code')
  const next                     = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to error page if code is missing or exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}