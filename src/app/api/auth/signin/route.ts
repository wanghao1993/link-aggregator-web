import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase/server';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, password')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    // Create session (simplified - in production use NextAuth.js sessions)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    // Store session in database
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        created_at: new Date().toISOString(),
      });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: profile || {},
      }
    });

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}