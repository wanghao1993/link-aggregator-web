"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">页面未找到</p>
        <Link 
          href="/" 
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
