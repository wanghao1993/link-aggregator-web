import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = { id: authUser.id };

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch notifications error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    const { count: unreadCount } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount: unreadCount ?? 0,
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = { id: authUser.id };

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all read error:", error);
      return NextResponse.json(
        { error: "Failed to mark notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all read API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
