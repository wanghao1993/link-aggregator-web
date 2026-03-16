import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/server';

// GET /api/admin/collections/stats - Get collections statistics
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    // Get total views and likes
    const { data: stats } = await supabaseAdmin
      .from('collections')
      .select('views, likes')
      .eq('is_public', true);

    const totalViews = stats?.reduce((sum, c) => sum + (c.views || 0), 0) || 0;
    const totalLikes = stats?.reduce((sum, c) => sum + (c.likes || 0), 0) || 0;

    return NextResponse.json({
      count: count || 0,
      totalViews,
      totalLikes,
    });
  } catch (error) {
    console.error('Error fetching collections stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
