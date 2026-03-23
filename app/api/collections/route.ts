import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("collections")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("is_public", true);
    }

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

    const collectionIds = (collections || []).map((c) => c.id);
    const userIds = [
      ...new Set((collections || []).map((c) => c.user_id).filter(Boolean)),
    ];

    // Batch fetch users
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

    // Batch fetch favorites for current user
    let favoritedIds = new Set<string>();
    const authUser = await getAuthUser();
    if (authUser && collectionIds.length > 0) {
      const { data: favorites } = await supabaseAdmin
        .from("collection_favorites")
        .select("collection_id")
        .eq("user_id", authUser.id)
        .in("collection_id", collectionIds);
      if (favorites) {
        favoritedIds = new Set(favorites.map((f) => f.collection_id));
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
      isFavorited: favoritedIds.has(c.id),
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
  is_public: z.boolean().default(true),
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

    const { title, description, category, tags, links, is_public } = parsed.data;
    const user = { id: authUser.id };

    // Auto-create tags that don't exist
    if (tags.length > 0) {
      const { data: existingTags } = await supabaseAdmin
        .from("tags")
        .select("name")
        .in("name", tags);

      const existingTagNames = new Set((existingTags || []).map((t) => t.name));
      const newTags = tags.filter((tag) => !existingTagNames.has(tag));

      if (newTags.length > 0) {
        const tagRows = newTags.map((tagName) => ({
          name: tagName,
          slug: tagName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          is_active: true,
          usage_count: 0,
        }));

        await supabaseAdmin.from("tags").insert(tagRows);
      }
    }

    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .insert({
        title,
        description,
        category,
        tags,
        user_id: user.id,
        is_public: is_public ?? true,
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
