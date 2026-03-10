import { supabaseAdmin } from "@/lib/supabase/server";

export type NotificationType =
  | "follow"
  | "like"
  | "favorite"
  | "comment"
  | "system";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content?: string;
  data?: Record<string, unknown>;
}

export async function createNotification({
  userId,
  type,
  title,
  content,
  data = {},
}: CreateNotificationParams) {
  try {
    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type,
      title,
      content: content ?? null,
      is_read: false,
      data,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to create notification:", error);
    }
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}
