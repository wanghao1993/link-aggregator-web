import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendVerificationEmail } from '@/lib/auth/auth';

const sendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendVerificationSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

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

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code in database (with expiration)
    const { error: storageError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email,
        code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (storageError) {
      console.error('Failed to store verification code:', storageError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}