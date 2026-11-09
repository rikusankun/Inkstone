import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updatePost } from "@/app/admin/actions";
import PriceToggle from "@/app/admin/PriceToggle";

// auth() 依赖 cookie，显式声明为动态渲染
export const dynamic = "force-dynamic";

// Next.js 14：params 为同步对象（Next.js 15+ 才是 Promise）
export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-100 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="text-xs text-stone-400 transition hover:text-stone-700"
        >
          ← 返回文章管理
        </Link>

        <header className="mb-9 mt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-stone-400">
            Edit · 编辑
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
            编辑文章
          </h1>
        </header>

        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-10">
          <form action={updatePost} className="space-y-7">
            <input type="hidden" name="id" value={post.id} />

            <div>
              <label htmlFor="title" className="mb-2.5 block text-xs font-medium tracking-wide text-stone-500">
                标题 *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={post.title}
                className="w-full rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="mb-2.5 block text-xs font-medium tracking-wide text-stone-500">
                摘要 *
              </label>
              <input
                id="excerpt"
                name="excerpt"
                type="text"
                required
                defaultValue={post.excerpt}
                className="w-full rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-2.5 block text-xs font-medium tracking-wide text-stone-500">
                正文 *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={18}
                defaultValue={post.content}
                className="min-h-[420px] w-full resize-y rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
              />
              <p className="mt-2 text-[11px] text-stone-400">用空行分段；前两段作为免费试读内容。</p>
            </div>

            {/* 付费开关 + 价格：回填当前文章的 isPremium 与 price */}
            <PriceToggle defaultPremium={post.isPremium} defaultPrice={post.price} />

            <div className="flex justify-end border-t border-stone-100 pt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-stone-900 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-900/15 sm:w-auto"
              >
                保存修改
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
