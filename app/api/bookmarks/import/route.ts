import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

const bookmarkLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
});

const folderSchema = z.object({
  folderTitle: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().optional().default("tools"),
  tags: z.array(z.string()).optional().default([]),
  bookmarks: z.array(bookmarkLinkSchema).min(1),
});

function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const importSchema = z.object({
  folders: z.array(folderSchema).min(1, "At least one folder is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { folders } = parsed.data;
    const userId = authUser.id;
    const now = new Date().toISOString();
    const createdCollections: { id: string; title: string; linkCount: number }[] = [];

    for (const folder of folders) {
      const validBookmarks = folder.bookmarks.filter((bm) =>
        isValidHttpUrl(bm.url)
      );
      if (validBookmarks.length === 0) continue;

      const collectionDescription =
        folder.description ||
        `Imported from browser bookmarks: ${folder.folderTitle}`;

      const { data: collection, error: collectionError } = await supabaseAdmin
        .from("collections")
        .insert({
          title: folder.folderTitle,
          description: collectionDescription,
          category: folder.category || "tools",
          tags: folder.tags || ["imported", "bookmarks"],
          user_id: userId,
          is_public: true,
          views: 0,
          likes: 0,
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (collectionError || !collection) {
        console.error("Failed to create collection:", collectionError);
        continue;
      }

      const linkRows = validBookmarks.map((bm, index) => ({
        collection_id: collection.id,
        title: bm.title,
        url: bm.url,
        description: bm.description || "",
        favicon: bm.icon || "",
        sort_order: index,
        created_at: now,
      }));

      const { error: linksError } = await supabaseAdmin
        .from("collection_links")
        .insert(linkRows);

      if (linksError) {
        console.error(
          `Failed to insert links for "${folder.folderTitle}":`,
          linksError
        );
      }

      createdCollections.push({
        id: collection.id,
        title: folder.folderTitle,
        linkCount: validBookmarks.length,
      });
    }

    return NextResponse.json(
      {
        message: "Bookmarks imported successfully",
        collections: createdCollections,
        totalCollections: createdCollections.length,
        totalLinks: createdCollections.reduce((sum, c) => sum + c.linkCount, 0),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bookmark import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
