import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();
    
    // Get user_id if authenticated, otherwise null for anonymous views
    const userId = authUser?.id || null;

    // Insert view record
    const { error: insertError } = await (await import("@/lib/supabase/server")).supabaseAdmin
      .from("collection_views")
      .insert({
        collection_id: id,
        user_id: userId,
        viewed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to record view:", insertError);
      // Don't fail the request if view recording fails
    }

    // Increment view count
    const { error: updateError } = await (await import("@/lib/supabase/server")).supabaseAdmin.rpc(
      "increment_collection_views",
      { collection_id: id }
    );

    // If RPC fails, try direct update as fallback
    if (updateError) {
      console.log("RPC not available, using direct update");
      await (await import("@/lib/supabase/server")).supabaseAdmin
        .from("collections")
        .update({ views: (await (await import("@/lib/supabase/server")).supabaseAdmin
          .from("collections")
          .select("views")
          .eq("id", id)
          .single()).data?.views + 1 })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record view error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
