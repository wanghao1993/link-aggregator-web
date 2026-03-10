import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import UserProfileClient from "./UserProfileClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const displayName = `User ${id.slice(0, 8)}`;

  return generateSeoMetadata({
    title: t("userTitle", { name: displayName }),
    description: t("userDesc", { name: displayName, count: 0 }),
    path: `/${locale}/user/${id}`,
    type: "profile",
    locale,
  });
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  return <UserProfileClient params={params} />;
}
