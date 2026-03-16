import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // 获取收藏总数
    const { count: totalCollections } = await supabaseAdmin
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true);

    // 获取活跃用户数
    const { count: activeUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    // 获取总浏览量（月度）
    const { data: viewsData } = await supabaseAdmin
      .from("collections")
      .select("views")
      .eq("is_public", true);

    const monthlyViews = (viewsData || []).reduce(
      (sum, item) => sum + (item.views || 0),
      0
    );

    // 获取精选收藏数（likes > 10 或 views > 100）
    const { count: featuredCollections } = await supabaseAdmin
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)
      .or("likes.gt.10,views.gt.100");

    return NextResponse.json({
      totalCollections: totalCollections || 0,
      activeUsers: activeUsers || 0,
      monthlyViews,
      featuredCollections: featuredCollections || 0,
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
