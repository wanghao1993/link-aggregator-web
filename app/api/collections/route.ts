import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextauth-config";
import { supabaseAdmin } from "@/lib/supabase/server";

const linkSchema = z.object({
  title: z.string().min(1, "Link title is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional().default(""),
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
