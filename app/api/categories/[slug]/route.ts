import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/categories/[slug] - Get category by slug with collections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Fetching category with slug:', slug);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get category by slug
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    console.log('Category query result:', { category, error: catError });

    if (catError) {
      console.error('Category query error:', catError);
      return NextResponse.json({ error: 'Category not found', details: catError.message }, { status: 404 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get collections in this category
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('id, title, description, category, tags, views, likes, created_at, updated_at')
      .eq('category', category.name_key)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (collError) {
      console.error('Collections query error:', collError);
    }

    return NextResponse.json({
      category,
      collections: collections || [],
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      error: 'Failed to fetch category',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
