import { NextResponse } from "next/server";
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

function buildRssXml(
  title: string,
  description: string,
  link: string,
  items: Array<{
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid: string;
    author?: string;
    categories?: string[];
  }>
): string {
  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>${
        item.author ? `\n      <author>${escapeXml(item.author)}</author>` : ""
      }${
        item.categories
          ? item.categories
              .map((c) => `\n      <category>${escapeXml(c)}</category>`)
              .join("")
          : ""
      }
    </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${escapeXml(link)}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${link}/api/rss`)}" rel="self" type="application/rss+xml"/>
    <generator>${escapeXml(getSiteName())}</generator>${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl();
    const siteName = getSiteName();

    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select(
        `
        id, title, description, category, tags, views, likes,
        created_at, updated_at, is_public,
        users:user_id (name, email)
      `
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("RSS feed error:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const items = (collections || []).map((c) => ({
      title: c.title,
      description: c.description || "",
      link: `${baseUrl}/zh/collection/${c.id}`,
      pubDate: c.created_at,
      guid: `${baseUrl}/zh/collection/${c.id}`,
      author: (c.users as { name?: string; email?: string } | null)?.name || undefined,
      categories: c.tags as string[] | undefined,
    }));

    const xml = buildRssXml(
      `${siteName} - Latest Collections`,
      "Discover the latest curated link collections on LinkHub",
      baseUrl,
      items
    );

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
