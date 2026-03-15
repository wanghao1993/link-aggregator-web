import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

// Check if collection is favorited by current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ isFavorited: false });
    }

    const { data } = await supabaseAdmin
      .from("collection_favorites")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("collection_id", id)
      .single();

    return NextResponse.json({ isFavorited: !!data });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json({ isFavorited: false });
  }
}

// Add to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already favorited
    const { data: existing } = await supabaseAdmin
      .from("collection_favorites")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("collection_id", id)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Already favorited" });
    }

    // Add favorite
    const { error: insertError } = await supabaseAdmin
      .from("collection_favorites")
      .insert({
        user_id: authUser.id,
        collection_id: id,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to add favorite:", insertError);
      return NextResponse.json(
        { error: "Failed to add favorite" },
        { status: 500 }
      );
    }

    // Increment likes count
    try {
      await supabaseAdmin.rpc("increment_collection_likes", { collection_id: id });
    } catch {
      // Fallback: direct update
      const { data: collection } = await supabaseAdmin
        .from("collections")
        .select("likes")
        .eq("id", id)
        .single();
      
      if (collection) {
        await supabaseAdmin
          .from("collections")
          .update({ likes: collection.likes + 1 })
          .eq("id", id);
      }
    }

    return NextResponse.json({ message: "Added to favorites", isFavorited: true });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Remove from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove favorite
    const { error: deleteError } = await supabaseAdmin
      .from("collection_favorites")
      .delete()
      .eq("user_id", authUser.id)
      .eq("collection_id", id);

    if (deleteError) {
      console.error("Failed to remove favorite:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove favorite" },
        { status: 500 }
      );
    }

    // Decrement likes count
    try {
      await supabaseAdmin.rpc("decrement_collection_likes", { collection_id: id });
    } catch {
      // Fallback: direct update
      const { data: collection } = await supabaseAdmin
        .from("collections")
        .select("likes")
        .eq("id", id)
        .single();
      
      if (collection && collection.likes > 0) {
        await supabaseAdmin
          .from("collections")
          .update({ likes: collection.likes - 1 })
          .eq("id", id);
      }
    }

    return NextResponse.json({ message: "Removed from favorites", isFavorited: false });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
