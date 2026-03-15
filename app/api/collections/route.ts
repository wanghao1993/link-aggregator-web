import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("collections")
      .select("*", { count: "exact" })
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: collections, error, count } = await query;

    if (error) {
      console.error("Failed to list collections:", error);
      return NextResponse.json(
        { error: "Failed to fetch collections" },
        { status: 500 }
      );
    }

    const userIds = [
      ...new Set((collections || []).map((c) => c.user_id).filter(Boolean)),
    ];

    let usersMap: Record<string, { id: string; name: string; email: string }> =
      {};
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, name, email")
        .in("id", userIds);
      if (users) {
        usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
      }
    }

    const formatted = (collections || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      tags: c.tags || [],
      isPublic: c.is_public,
      views: c.views,
      likes: c.likes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author: usersMap[c.user_id] || null,
    }));

    return NextResponse.json({ collections: formatted, total: count || 0 });
  } catch (error) {
    console.error("List collections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const linkSchema = z.object({
  title: z.string().min(1, "Link title is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional().default(""),
  favicon: z.string().optional().default(""),
});

const createCollectionSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  links: z.array(linkSchema).min(1, "At least one link is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, category, tags, links } = parsed.data;
    const user = { id: authUser.id };

    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .insert({
        title,
        description,
        category,
        tags,
        user_id: user.id,
        is_public: true,
        views: 0,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (collectionError) {
      console.error("Failed to create collection:", collectionError);
      return NextResponse.json(
        { error: "Failed to create collection" },
        { status: 500 }
      );
    }

    if (links.length > 0) {
      const linkRows = links.map((link, index) => ({
        collection_id: collection.id,
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

    return NextResponse.json(
      { id: collection.id, message: "Collection created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
