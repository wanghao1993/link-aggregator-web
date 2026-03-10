import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getBaseUrl, getSiteName } from "@/lib/seo";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const baseUrl = getBaseUrl();
    const siteName = getSiteName();

    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .select(
        `
        id, title, description, category, tags,
        created_at, updated_at, is_public,
        users:user_id (name, email),
        collection_links (id, title, url, description, sort_order, created_at)
      `
      )
      .eq("id", id)
      .single();

    if (error || !collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    if (!collection.is_public) {
      return new NextResponse("Collection is private", { status: 403 });
    }

    const author = collection.users as { name?: string; email?: string } | null;
    const links = (
      (collection.collection_links as Array<{
        id: string;
        title: string;
        url: string;
        description: string;
        sort_order: number;
        created_at: string;
      }>) || []
    ).sort((a, b) => a.sort_order - b.sort_order);

    const collectionUrl = `${baseUrl}/zh/collection/${collection.id}`;

    const itemsXml = links
      .map(
        (link) => `
    <item>
      <title>${escapeXml(link.title)}</title>
      <description>${escapeXml(link.description || "")}</description>
      <link>${escapeXml(link.url)}</link>
      <guid isPermaLink="false">${escapeXml(`${collection.id}-${link.id}`)}</guid>
      <pubDate>${new Date(link.created_at || collection.created_at).toUTCString()}</pubDate>
    </item>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(collection.title)} - ${escapeXml(siteName)}</title>
    <description>${escapeXml(collection.description || "")}</description>
    <link>${escapeXml(collectionUrl)}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(collection.updated_at || collection.created_at).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/api/rss/${id}`)}" rel="self" type="application/rss+xml"/>${
      author?.name ? `\n    <managingEditor>${escapeXml(author.name)}</managingEditor>` : ""
    }${
      (collection.tags as string[] | undefined)
        ?.map((t: string) => `\n    <category>${escapeXml(t)}</category>`)
        .join("") || ""
    }${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1200",
      },
    });
  } catch (err) {
    console.error("RSS generation error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
