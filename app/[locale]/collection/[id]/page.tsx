import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase/server";
import CollectionDetailClient from "./CollectionDetailClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const notFoundT = await getTranslations({ locale, namespace: "notFound" });

  const { data: collection } = await supabaseAdmin
    .from("collections")
    .select("title, description, tags")
    .eq("id", id)
    .single();

  if (!collection) {
    return { title: notFoundT("message") };
  }

  const metadata = generateSeoMetadata({
    title: t("collectionTitle", { title: collection.title }),
    description: t("collectionDesc", {
      title: collection.title,
      description: (collection.description || "").slice(0, 120),
    }),
    path: `/${locale}/collection/${id}`,
    type: "article",
    locale,
  });

  return {
    ...metadata,
    keywords: collection.tags || [],
  };
}

export default function CollectionDetailPage() {
  return <CollectionDetailClient />;
}
