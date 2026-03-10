import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextauth-config";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications/create";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const session = await getServerSession(authOptions);

    const { count: followersCount } = await supabaseAdmin
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", targetUserId);

    const { count: followingCount } = await supabaseAdmin
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", targetUserId);

    let isFollowing = false;
    if (session?.user?.email) {
      const { data: currentUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (currentUser) {
        const { data: follow } = await supabaseAdmin
          .from("user_follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", targetUserId)
          .single();

        isFollowing = !!follow;
      }
    }

    return NextResponse.json({
      isFollowing,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;

    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const { data: existingFollow } = await supabaseAdmin
      .from("user_follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)
      .single();

    if (existingFollow) {
      await supabaseAdmin
        .from("user_follows")
        .delete()
        .eq("id", existingFollow.id);

      return NextResponse.json({
        action: "unfollowed",
        isFollowing: false,
      });
    } else {
      await supabaseAdmin.from("user_follows").insert({
        follower_id: currentUser.id,
        following_id: targetUserId,
        created_at: new Date().toISOString(),
      });

      const followerName =
        session.user.name || session.user.email?.split("@")[0] || "Someone";

      createNotification({
        userId: targetUserId,
        type: "follow",
        title: `${followerName} followed you`,
        content: "",
        data: {
          followerId: currentUser.id,
          followerName,
          followerEmail: session.user.email,
        },
      });

      return NextResponse.json({
        action: "followed",
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Toggle follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
