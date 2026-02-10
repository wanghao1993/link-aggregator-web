import { ReactNode } from "react";

// Root layout: just pass through. Redirect from `/` to default locale
// is handled by next-intl middleware (middleware.ts).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
