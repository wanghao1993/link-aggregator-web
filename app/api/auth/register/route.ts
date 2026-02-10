import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
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

    // Verify verification code
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

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, name, email')
      .single();

    if (userError) {
      console.error('Failed to create user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Delete used verification code
    await supabaseAdmin
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('code', verificationCode);

    // Create user profile
    await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.id,
        username: email.split('@')[0],
        display_name: name,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    // Send welcome email (fire and forget)
    sendWelcomeEmail(email, name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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