import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Check for OAuth errors
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  // Handle password reset recovery
  if (type === 'recovery' && (code || token)) {
    const resetUrl = `/auth/reset-password?token=${code || token}&type=recovery`;
    return NextResponse.redirect(`${origin}${resetUrl}`);
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Handle error in middleware/server component context
              }
            },
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log('OAuth login successful, redirecting to:', next);
        return NextResponse.redirect(`${origin}${next}`);
      }

      console.error('Exchange code for session error:', error);
    } catch (err) {
      console.error('Callback processing error:', err);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
}
