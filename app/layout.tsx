import { ReactNode } from "react";
import "@/index.css";
import Header from "@/components/Header";
import { Providers } from "./providers";

export const metadata = {
  title: "LinkHub - 精选链接合集",
  description: "探索社区精心策划的高质量资源合集",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
