import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inkstone · 墨聚于此，知识有价",
  description: "知识付费博客基础骨架",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-base font-semibold tracking-tight">
              砚台 <span className="font-normal text-stone-400">Inkstone</span>
            </Link>

            <div className="flex items-center gap-4 text-sm">
              {session?.user ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      ADMIN
                    </span>
                  )}
                  <span className="hidden text-stone-600 sm:inline">{session.user.email}</span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs transition hover:border-stone-900"
                    >
                      写文章
                    </Link>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs transition hover:border-stone-900"
                    >
                      退出登录
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stone-700"
                >
                  登录
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
