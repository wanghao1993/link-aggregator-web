const SITE_NAME = "LinkHub";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linkhub.example.com";

export interface SeoParams {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  noIndex?: boolean;
}

export function getBaseUrl(): string {
  return SITE_URL;
}

export function getSiteName(): string {
  return SITE_NAME;
}

export function buildCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function generateSeoMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  locale = "zh",
  noIndex = false,
}: SeoParams) {
  const url = buildCanonicalUrl(path);
  const ogImage = image || `${SITE_URL}/icons/og-default.png`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: buildCanonicalUrl(`/en${path.replace(/^\/(en|zh)/, "")}`),
        zh: buildCanonicalUrl(`/zh${path.replace(/^\/(en|zh)/, "")}`),
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}

export function generateCollectionMetadata(
  collection: { title: string; description: string; tags: string[] },
  locale: string,
  id: string
) {
  return generateSeoMetadata({
    title: collection.title,
    description: collection.description.slice(0, 160),
    path: `/${locale}/collection/${id}`,
    type: "article",
    locale,
  });
}

export function generateTagMetadata(
  tag: string,
  count: number,
  locale: string
) {
  const title = locale === "zh" ? `标签: ${tag}` : `Tag: ${tag}`;
  const description =
    locale === "zh"
      ? `浏览标签「${tag}」下的 ${count} 个精选链接合集`
      : `Browse ${count} curated link collections tagged with "${tag}"`;

  return generateSeoMetadata({
    title,
    description,
    path: `/${locale}/tags/${encodeURIComponent(tag)}`,
    locale,
  });
}

export function generateUserMetadata(
  user: { name?: string; username: string },
  collectionsCount: number,
  locale: string,
  userId: string
) {
  const displayName = user.name || user.username;
  const title = locale === "zh" ? `${displayName} 的主页` : `${displayName}'s Profile`;
  const description =
    locale === "zh"
      ? `查看 ${displayName} 创建的 ${collectionsCount} 个链接合集`
      : `View ${collectionsCount} link collections created by ${displayName}`;

  return generateSeoMetadata({
    title,
    description,
    path: `/${locale}/user/${userId}`,
    type: "profile",
    locale,
  });
}

export function generateRssUrl(collectionId?: string): string {
  if (collectionId) {
    return `${SITE_URL}/api/rss/${collectionId}`;
  }
  return `${SITE_URL}/api/rss`;
}
