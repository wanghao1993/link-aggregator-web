import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

const addLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  favicon: z.string().optional().default(""),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = addLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if collection exists and belongs to user
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.user_id !== authUser.id) {
      return NextResponse.json(
        { error: "Not authorized to add links to this collection" },
        { status: 403 }
      );
    }

    // Get max sort_order
    const { data: maxOrder } = await supabaseAdmin
      .from("collection_links")
      .select("sort_order")
      .eq("collection_id", id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.sort_order ?? -1) + 1;

    const { data: link, error: linkError } = await supabaseAdmin
      .from("collection_links")
      .insert({
        collection_id: id,
        url: parsed.data.url,
        title: parsed.data.title || "",
        description: parsed.data.description || "",
        favicon: parsed.data.favicon || "",
        sort_order: newOrder,
      })
      .select("id")
      .single();

    if (linkError) {
      console.error("Failed to add link:", linkError);
      return NextResponse.json(
        { error: "Failed to add link" },
        { status: 500 }
      );
    }

    // Update collection updated_at
    await supabaseAdmin
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json(
      { id: link.id, message: "Link added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add link error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
