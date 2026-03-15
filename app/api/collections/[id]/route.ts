import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional().default(""),
  favicon: z.string().optional().default(""),
});

const updateCollectionSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  links: z.array(linkSchema).min(1, "At least one link is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const { data: links } = await supabaseAdmin
      .from("collection_links")
      .select("id, title, url, description, favicon, sort_order")
      .eq("collection_id", id)
      .order("sort_order", { ascending: true });

    let author: { id: string; name: string; email: string } | null = null;
    if (collection.user_id) {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("id, name, email")
        .eq("id", collection.user_id)
        .single();
      if (userData) {
        author = userData;
      }
    }

    const formatted = {
      id: collection.id,
      title: collection.title,
      description: collection.description,
      category: collection.category,
      tags: collection.tags || [],
      isPublic: collection.is_public,
      views: collection.views,
      likes: collection.likes,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      author,
      links: (links || []).map(
        (link: {
          id: string;
          title: string;
          url: string;
          description: string;
          favicon: string;
        }) => ({
          id: link.id,
          title: link.title,
          url: link.url,
          description: link.description,
          favicon: link.favicon,
        })
      ),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get collection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = { id: authUser.id };

    const { data: existing } = await supabaseAdmin
      .from("collections")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this collection" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, category, tags, links } = parsed.data;

    const { error: updateError } = await supabaseAdmin
      .from("collections")
      .update({
        title,
        description,
        category,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update collection:", updateError);
      return NextResponse.json(
        { error: "Failed to update collection" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("collection_links")
      .delete()
      .eq("collection_id", id);

    if (links.length > 0) {
      const linkRows = links.map((link, index) => ({
        collection_id: id,
        title: link.title,
        url: link.url,
        description: link.description || "",
        favicon: link.favicon || "",
        sort_order: index,
        created_at: new Date().toISOString(),
      }));

      const { error: linksError } = await supabaseAdmin
        .from("collection_links")
        .insert(linkRows);

      if (linksError) {
        console.error("Failed to insert links:", linksError);
      }
    }

    return NextResponse.json({
      id,
      message: "Collection updated successfully",
    });
  } catch (error) {
    console.error("Update collection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
