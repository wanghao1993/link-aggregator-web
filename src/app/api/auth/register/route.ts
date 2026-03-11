import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/auth/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, verificationCode } = parsed.data;

    // Verify the email verification code
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', verificationCode)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (verificationError || !verificationData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user already exists in Supabase Auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email);

    if (existingAuthUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user via Supabase Auth (handles password hashing internally)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth createUser failed:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user account' },
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    // Create row in custom users table linked to auth.users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUserId,
        name,
        email,
        email_verified: true,
      });

    if (userError) {
      console.error('Failed to create custom user row:', userError);
      // Roll back Supabase Auth user on failure
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUserId,
        username: email.split('@')[0],
        display_name: name,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
    }

    // Delete used verification code
    await supabaseAdmin
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('code', verificationCode);

    // Send welcome email (fire and forget)
    sendWelcomeEmail(email, name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: authUserId,
          name,
          email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
