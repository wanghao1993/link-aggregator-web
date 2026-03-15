import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyCaptcha } from '@/lib/captcha';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  captchaToken: z.string().min(1, 'Captcha token is required'),
  captchaInput: z.string().min(1, 'Captcha input is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, captchaToken, captchaInput } = parsed.data;

    // Verify captcha
    if (!verifyCaptcha(captchaToken, captchaInput)) {
      return NextResponse.json(
        { error: 'captcha_invalid' },
        { status: 400 }
      );
    }

    // Send password reset email via Supabase
    // The email will contain a link that redirects to /api/auth/callback?type=recovery&token=xxx
    // which will then redirect to /auth/reset-password with the token
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?type=recovery`,
      }
    );

    if (resetError) {
      console.error('Supabase reset password error:', resetError);
      // Still return success to avoid email enumeration
      // But log the error for debugging
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
