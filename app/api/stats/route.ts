import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Parallel fetch all stats - eliminates waterfall
    const [
      collectionsResult,
      usersResult,
      viewsResult,
      featuredResult,
    ] = await Promise.all([
      // Total public collections
      supabaseAdmin
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true),
      // Active users
      supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true }),
      // Views for monthly calculation
      supabaseAdmin
        .from("collections")
        .select("views")
        .eq("is_public", true),
      // Featured collections (likes > 10 or views > 100)
      supabaseAdmin
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true)
        .or("likes.gt.10,views.gt.100"),
    ]);

    const totalCollections = collectionsResult.count || 0;
    const activeUsers = usersResult.count || 0;
    const monthlyViews = (viewsResult.data || []).reduce(
      (sum, item) => sum + (item.views || 0),
      0
    );
    const featuredCollections = featuredResult.count || 0;

    return NextResponse.json({
      totalCollections,
      activeUsers,
      monthlyViews,
      featuredCollections,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      {
        totalCollections: 0,
        activeUsers: 0,
        monthlyViews: 0,
        featuredCollections: 0,
      },
      { status: 200 }
    );
  }
}
