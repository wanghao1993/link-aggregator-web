import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "@/locales";

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request (set by next-intl middleware)
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = "zh";
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
