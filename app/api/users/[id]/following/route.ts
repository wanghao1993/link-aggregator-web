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
        following:following_id (id, name, email, image)
      `
      )
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get following error:", error);
      return NextResponse.json(
        { error: "Failed to get following list" },
        { status: 500 }
      );
    }

    const { count } = await supabaseAdmin
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    const following = (follows || []).map((f) => {
      const followingUser = f.following as { id?: string; name?: string; email?: string; image?: string } | null;
      return {
        id: followingUser?.id,
        name: followingUser?.name,
        email: followingUser?.email,
        image: followingUser?.image,
        followedAt: f.created_at,
      };
    });

    return NextResponse.json({
      following,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get following error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
