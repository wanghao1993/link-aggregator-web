import { NextRequest, NextResponse } from 'next/server';
import { devOAuth } from '@/lib/auth/dev-oauth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as 'github' | 'google';
    const state = searchParams.get('state');

    if (!provider || !['github', 'google'].includes(provider)) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_provider', request.url));
    }

    if (!state) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_state', request.url));
    }

    // Simulate OAuth callback with mock code
    const mockCode = 'dev_oauth_code_' + Date.now();
    const oauthUser = await devOAuth.handleCallback(provider, mockCode, state);

    console.log(`🔐 [DEV OAUTH] Processing ${provider} user:`, oauthUser);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', oauthUser.email)
      .single();

    let userId: string;
    let userName: string;

    if (existingUser) {
      // Existing user - update last login
      userId = existingUser.id;
      userName = existingUser.name;
      
      await supabaseAdmin
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    } else {
      // New user - create account
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          name: oauthUser.name,
          email: oauthUser.email,
          email_verified: true,
          image: oauthUser.image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, name')
        .single();

      if (userError) {
        console.error('Failed to create OAuth user:', userError);
        return NextResponse.redirect(new URL('/auth/error?error=user_creation_failed', request.url));
      }

      userId = newUser.id;
      userName = newUser.name;

      // Create OAuth account record
      await supabaseAdmin
        .from('accounts')
        .insert({
          user_id: userId,
          type: 'oauth',
          provider,
          provider_account_id: oauthUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      // Create user profile
      await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          username: oauthUser.email.split('@')[0],
          display_name: oauthUser.name,
          avatar_url: oauthUser.image,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      console.log(`🎉 [DEV OAUTH] New ${provider} user created:`, userName);
    }

    // Create session
    const sessionToken = Buffer.from(`${userId}:${Date.now()}:${provider}`).toString('base64');
    
    await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });

    // Redirect to home with session cookie
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);
    
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('user_name', userName, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log(`✅ [DEV OAUTH] ${provider} login successful for:`, userName);
    return response;

  } catch (error) {
    console.error('DEV OAUTH callback error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=oauth_failed', request.url));
  }
}