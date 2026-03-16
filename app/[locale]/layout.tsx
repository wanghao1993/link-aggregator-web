import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import "@/index.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "../providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/locales";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl } from "@/lib/seo";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Theme color initialization script - runs before page render to prevent flash
const themeInitScript = `
(function() {
  try {
    // Theme colors mapping
    const themes = {
      default: { primary: '13 148 136', secondary: '20 184 166', accent: '245 158 11', primaryHover: '15 118 110', accentHover: '217 119 6' },
      ocean: { primary: '14 165 233', secondary: '56 189 248', accent: '245 158 11', primaryHover: '3 105 161', accentHover: '217 119 6' },
      forest: { primary: '22 163 74', secondary: '34 197 94', accent: '251 146 60', primaryHover: '21 128 61', accentHover: '234 88 12' },
      sunset: { primary: '234 88 12', secondary: '249 115 22', accent: '14 165 233', primaryHover: '194 65 12', accentHover: '3 105 161' },
      rose: { primary: '225 29 72', secondary: '244 63 94', accent: '16 185 129', primaryHover: '190 18 60', accentHover: '5 150 105' },
      violet: { primary: '124 58 237', secondary: '139 92 246', accent: '34 197 94', primaryHover: '109 40 217', accentHover: '22 163 74' },
      slate: { primary: '71 85 105', secondary: '100 116 139', accent: '245 158 11', primaryHover: '51 65 85', accentHover: '217 119 6' },
      amber: { primary: '217 119 6', secondary: '245 158 11', accent: '14 165 233', primaryHover: '180 83 9', accentHover: '3 105 161' }
    };

    const savedTheme = localStorage.getItem('theme-color') || 'default';
    const theme = themes[savedTheme] || themes.default;
    const root = document.documentElement;

    root.style.setProperty('--color-brand-primary', theme.primary);
    root.style.setProperty('--color-brand-secondary', theme.secondary);
    root.style.setProperty('--color-brand-accent', theme.accent);
    root.style.setProperty('--color-primary', 'rgb(' + theme.primary + ')');
    root.style.setProperty('--color-primary-hover', 'rgb(' + theme.primaryHover + ')');
    root.style.setProperty('--color-primary-light', 'rgba(' + theme.primary + ' / 0.1)');
    root.style.setProperty('--color-primary-lighter', 'rgba(' + theme.primary + ' / 0.05)');
    root.style.setProperty('--color-accent', 'rgb(' + theme.accent + ')');
    root.style.setProperty('--color-accent-hover', 'rgb(' + theme.accentHover + ')');
    root.style.setProperty('--color-accent-light', 'rgba(' + theme.accent + ' / 0.1)');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, rgb(' + theme.primary + ') 0%, rgb(' + theme.secondary + ') 100%)');
    root.style.setProperty('--gradient-accent', 'linear-gradient(135deg, rgb(' + theme.accent + ') 0%, rgb(251 146 60) 100%)');

    // Update button colors
    root.style.setProperty('--button-primary-bg', 'rgb(' + theme.primary + ')');
    root.style.setProperty('--button-primary-hover', 'rgb(' + theme.primaryHover + ')');
    root.style.setProperty('--button-accent-bg', 'rgb(' + theme.accent + ')');
    root.style.setProperty('--button-accent-hover', 'rgb(' + theme.accentHover + ')');
  } catch (e) {}
})();
`;

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
        {/* Theme color init - must run before render to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="bottom-right" />
            <ServiceWorkerRegister />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
