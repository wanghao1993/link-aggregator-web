import { NextRequest, NextResponse } from 'next/server';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: 502 }
      );
    }

    const html = await response.text();
    const metadata = extractMetadata(html, parsedUrl);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link preview' },
      { status: 500 }
    );
  }
}

function extractMetadata(html: string, url: URL): LinkMetadata {
  // Remove script tags to avoid executing JS
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const metadata: LinkMetadata = {
    title: '',
    description: '',
    image: '',
    favicon: '',
    siteName: '',
  };

  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    metadata.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract meta tags
  const metaRegex = /<meta[^>]*>/gi;
  const metaTags = cleanHtml.match(metaRegex) || [];

  for (const meta of metaTags) {
    const property = getAttribute(meta, 'property') || getAttribute(meta, 'name');
    const content = getAttribute(meta, 'content');

    if (!property || !content) continue;

    const prop = property.toLowerCase();
    
    switch (prop) {
      case 'og:title':
      case 'twitter:title':
        if (!metadata.title) metadata.title = decodeHtmlEntities(content);
        break;
      case 'og:description':
      case 'twitter:description':
      case 'description':
        if (!metadata.description) metadata.description = decodeHtmlEntities(content);
        break;
      case 'og:image':
      case 'twitter:image':
      case 'twitter:image:src':
        if (!metadata.image) metadata.image = resolveUrl(content, url);
        break;
      case 'og:site_name':
      case 'twitter:site':
        if (!metadata.siteName) metadata.siteName = decodeHtmlEntities(content);
        break;
    }
  }

  // Extract favicon
  metadata.favicon = extractFavicon(cleanHtml, url);

  // Fallback: use domain as site name
  if (!metadata.siteName) {
    metadata.siteName = url.hostname.replace(/^www\./, '');
  }

  // Limit description length
  if (metadata.description.length > 300) {
    metadata.description = metadata.description.substring(0, 300) + '...';
  }

  return metadata;
}

function getAttribute(tag: string, name: string): string | null {
  const regex = new RegExp(`${name}=["']([^"']+)["']`, 'i');
  const match = tag.match(regex);
  return match ? match[1] : null;
}

function extractFavicon(html: string, baseUrl: URL): string {
  // Try to find favicon link
  const faviconRegex = /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/i;
  const faviconMatch = html.match(faviconRegex);

  if (faviconMatch) {
    const href = getAttribute(faviconMatch[0], 'href');
    if (href) {
      return resolveUrl(href, baseUrl);
    }
  }

  // Fallback to default favicon location
  return `${baseUrl.protocol}//${baseUrl.hostname}/favicon.ico`;
}

function resolveUrl(url: string, baseUrl: URL): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `${baseUrl.protocol}${url}`;
  }
  if (url.startsWith('/')) {
    return `${baseUrl.protocol}//${baseUrl.hostname}${url}`;
  }
  return `${baseUrl.protocol}//${baseUrl.hostname}/${url}`;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (match) => entities[match] || match);
}
