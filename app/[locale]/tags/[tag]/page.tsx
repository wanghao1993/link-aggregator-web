import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import TagDetailClient from "./TagDetailClient";

type Props = {
  params: Promise<{ locale: string; tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    ...generateSeoMetadata({
      title: t("tagTitle", { tag: decodedTag }),
      description: t("tagDesc", { tag: decodedTag, count: 0 }),
      path: `/${locale}/tags/${tag}`,
      locale,
    }),
    keywords: [decodedTag, "links", "collections"],
  };
}

export default function TagDetailPage() {
  return <TagDetailClient />;
}
