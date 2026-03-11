import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
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

    const { email, verificationCode } = parsed.data;

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

    // Delete used verification code
    await supabaseAdmin
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('code', verificationCode);

    // Client will call supabase.auth.signInWithPassword() to establish the session
    return NextResponse.json(
      { message: 'Verification successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
