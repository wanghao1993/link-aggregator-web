import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

interface FavoriteCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface FavoriteWithCollection {
  created_at: string;
  collections: FavoriteCollection | null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user's favorited collections
    const { data: favorites, error } = await supabaseAdmin
      .from("collection_favorites")
      .select(`
        created_at,
        collections (
          id,
          title,
          description,
          category,
          tags,
          views,
          likes,
          created_at,
          updated_at,
          user_id
        )
      `)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch favorites:", error);
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }

    // Get author info for each collection
    const typedFavorites = favorites as unknown as FavoriteWithCollection[] | null;
    const collections = typedFavorites
      ?.filter((f) => f.collections && !Array.isArray(f.collections))
      .map((f) => ({
        ...(f.collections as FavoriteCollection),
        favoritedAt: f.created_at,
      })) || [];

    // Fetch authors
    const userIds = [...new Set(collections.map((c) => c.user_id).filter(Boolean))];
    let usersMap: Record<string, { id: string; name: string; email: string }> = {};
    
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, name, email")
        .in("id", userIds);
      
      if (users) {
        usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
      }
    }

    const formatted = collections.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      tags: c.tags || [],
      views: c.views,
      likes: c.likes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author: usersMap[c.user_id] || null,
      favoritedAt: c.favoritedAt,
    }));

    return NextResponse.json({ favorites: formatted });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
