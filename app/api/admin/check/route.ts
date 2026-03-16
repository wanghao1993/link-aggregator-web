import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/admin/check - Check if current user is admin
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false, user: null });
    }

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ isAdmin: false, user: null });
    }

    const isAdmin = userData.role === 'admin' || userData.role === 'super_admin';

    return NextResponse.json({
      isAdmin,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false, user: null });
  }
}
