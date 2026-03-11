import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: notificationId } = await params;
    const currentUser = { id: authUser.id };

    const { data: notification } = await supabaseAdmin
      .from("notifications")
      .select("id, user_id")
      .eq("id", notificationId)
      .single();

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.user_id !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Mark read error:", error);
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark single read API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
