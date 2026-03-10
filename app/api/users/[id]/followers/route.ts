import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const { data: follows, error } = await supabaseAdmin
      .from("user_follows")
      .select(
        `
        id,
        created_at,
        follower:follower_id (id, name, email, image)
      `
      )
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get followers error:", error);
      return NextResponse.json(
        { error: "Failed to get followers" },
        { status: 500 }
      );
    }

    const { count } = await supabaseAdmin
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    const followers = (follows || []).map((f) => {
      const follower = f.follower as { id?: string; name?: string; email?: string; image?: string } | null;
      return {
        id: follower?.id,
        name: follower?.name,
        email: follower?.email,
        image: follower?.image,
        followedAt: f.created_at,
      };
    });

    return NextResponse.json({
      followers,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
