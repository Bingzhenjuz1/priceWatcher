import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PriceWatcher",
  description: "Compare prices and watch target prices"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-semibold text-ink">
              PriceWatcher
            </Link>
            <div className="flex gap-4 text-sm text-muted">
              <Link href="/">搜索</Link>
              <Link href="/platforms">平台状态</Link>
              <Link href="/alerts">提醒中心</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
