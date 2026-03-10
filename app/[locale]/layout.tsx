import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import "@/index.css";
import Header from "@/components/Header";
import { Providers } from "../providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/locales";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl, generateRssUrl } from "@/lib/seo";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = getBaseUrl();

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("title"),
    },
    formatDetection: {
      telephone: false,
    },
    alternates: {
      types: {
        "application/rss+xml": generateRssUrl(),
      },
    },
    icons: {
      icon: "/icons/icon-192x192.svg",
      apple: "/icons/icon-192x192.svg",
    },
    metadataBase: new URL(baseUrl),
  } satisfies Metadata;
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="min-h-screen">
              <Header />
              {children}
            </div>
            <Toaster position="bottom-right" />
            <ServiceWorkerRegister />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
