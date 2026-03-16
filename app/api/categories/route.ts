import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/categories - Get all categories with collection counts
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all active categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (catError) throw catError;

    // Get collection counts per category
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('category')
      .eq('is_public', true);

    if (collError) throw collError;

    // Count collections per category
    const countMap = new Map<string, number>();
    collections?.forEach((c) => {
      const cat = c.category || 'other';
      countMap.set(cat, (countMap.get(cat) || 0) + 1);
    });

    // Merge counts with categories
    const result = categories?.map((cat) => ({
      ...cat,
      collection_count: countMap.get(cat.name_key) || 0,
    }));

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
