import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthUser } from '@/lib/supabase/server';

// GET /api/categories/[slug] - Get category by slug with collections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const authUser = await getAuthUser();

    // Get category by slug
    const { data: category, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (catError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get collections in this category
    const { data: collections, error: collError } = await supabaseAdmin
      .from('collections')
      .select('id, title, description, category, tags, views, likes, created_at, updated_at, user_id')
      .eq('category', category.name_key)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (collError) {
      console.error('Collections query error:', collError);
    }

    const collectionIds = (collections || []).map((c) => c.id);

    // Batch fetch favorites for current user
    let favoritedIds = new Set<string>();
    if (authUser && collectionIds.length > 0) {
      const { data: favorites } = await supabaseAdmin
        .from('collection_favorites')
        .select('collection_id')
        .eq('user_id', authUser.id)
        .in('collection_id', collectionIds);
      if (favorites) {
        favoritedIds = new Set(favorites.map((f) => f.collection_id));
      }
    }

    // Get users for collections
    const userIds = [...new Set((collections || []).map((c) => c.user_id).filter(Boolean))];
    let usersMap: Record<string, { id: string; name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      if (users) {
        usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
      }
    }

    const formattedCollections = (collections || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      tags: c.tags || [],
      views: c.views,
      likes: c.likes,
      isFavorited: favoritedIds.has(c.id),
      created_at: c.created_at,
      updated_at: c.updated_at,
      users: usersMap[c.user_id] || null,
    }));

    return NextResponse.json({
      category,
      collections: formattedCollections,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      error: 'Failed to fetch category',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
