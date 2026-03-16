import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Ensure user exists in custom tables after OAuth login
 * Uses upsert to handle race conditions and existing users
 */
async function ensureUserExists(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const userId = authUser.id;
  const email = authUser.email || '';
  const name = (authUser.user_metadata?.name as string) ||
    (authUser.user_metadata?.full_name as string) ||
    (authUser.user_metadata?.preferred_username as string) ||
    email.split('@')[0];
  const avatarUrl = (authUser.user_metadata?.avatar_url as string) ||
    (authUser.user_metadata?.picture as string) ||
    (authUser.user_metadata?.image as string) || '';

  console.log('Ensuring user exists:', { userId, email, name, hasAvatar: !!avatarUrl });

  try {
    // Step 1: Upsert user record (handles both create and update)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        name,
        email,
        email_verified: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (userError) {
      console.error('Failed to upsert user record:', userError);
      // Don't continue if user creation failed
      return;
    }

    console.log('User record upserted successfully');

    // Step 2: Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, avatar_url')
      .eq('user_id', userId)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Error checking profile:', profileCheckError);
    }

    if (!existingProfile) {
      // Create new profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          username: email.split('@')[0],
          display_name: name,
          avatar_url: avatarUrl,
        });

      if (profileError) {
        console.error('Failed to create profile record:', profileError);
      } else {
        console.log('Profile created successfully');
      }
    } else {
      // Profile exists, update avatar only if user doesn't have one
      if (avatarUrl && !existingProfile.avatar_url) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to update profile avatar:', updateError);
        } else {
          console.log('Profile avatar updated');
        }
      }
    }
  } catch (error) {
    console.error('Error in ensureUserExists:', error);
  }
}

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

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        console.log('OAuth login successful for user:', data.user.id);

        // Ensure user exists in custom tables
        await ensureUserExists(data.user);

        return NextResponse.redirect(`${origin}${next}`);
      }

      console.error('Exchange code for session error:', error);
    } catch (err) {
      console.error('Callback processing error:', err);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
}
