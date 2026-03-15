import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password, token } = parsed.data;

    // Verify the token and update the password
    // The token from Supabase is sent as a query parameter or hash fragment
    // We need to exchange it for a session or use the admin API
    
    // Try to get the user from the token
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token);

    if (getUserError || !user) {
      // If token is invalid, try using the admin API to verify
      // This handles the case where the token is passed differently
      console.error('Get user error:', getUserError);
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error('Update password error:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
