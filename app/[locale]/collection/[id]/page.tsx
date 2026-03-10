import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSeoMetadata, generateRssUrl } from "@/lib/seo";
import CollectionDetailClient from "./CollectionDetailClient";

const collectionTitles: Record<string, { title: string; description: string; tags: string[] }> = {
  "1": {
    title: "AI & Machine Learning Resources",
    description: "精心策划的AI和机器学习工具、论文和教程合集,涵盖从基础理论到实际应用的各个方面",
    tags: ["AI", "Machine Learning", "Tools", "Papers"],
  },
  "2": {
    title: "Web Development Tools",
    description: "现代Web开发必备工具和库的完整集合,包括框架、构建工具、UI组件等",
    tags: ["React", "Vue", "Angular", "Tools"],
  },
  "3": {
    title: "Design Inspiration",
    description: "美丽的设计案例和资源库,为设计师提供源源不断的创意灵感",
    tags: ["UI/UX", "Inspiration", "Colors", "Typography"],
  },
};

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const collection = collectionTitles[id];
  if (!collection) {
    return { title: "Not Found" };
  }

  const metadata = generateSeoMetadata({
    title: t("collectionTitle", { title: collection.title }),
    description: t("collectionDesc", {
      title: collection.title,
      description: collection.description.slice(0, 120),
    }),
    path: `/${locale}/collection/${id}`,
    type: "article",
    locale,
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: {
        "application/rss+xml": generateRssUrl(id),
      },
    },
    keywords: collection.tags,
  };
}

export default function CollectionDetailPage() {
  return <CollectionDetailClient />;
}
