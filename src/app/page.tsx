import Link from "next/link";
import { prisma } from "@/lib/prisma";

// 避免构建期预渲染时访问数据库
export const dynamic = "force-dynamic";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <section className="py-20 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Inkstone · 砚台</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          墨聚于此，知识有价
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-stone-500">
          把值得反复读的文字，交给愿意认真读的人。免费试读，一元解锁完整版。
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-16 text-center text-sm text-stone-500">
          暂无文章，请去后台发布
        </p>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group flex min-h-[220px] flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-stone-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">{formatDate(post.createdAt)}</span>
                {post.isPremium ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    付费 · ¥1
                  </span>
                ) : (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                    免费阅读
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-lg font-semibold leading-snug text-stone-900 group-hover:text-stone-600">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-500">{post.excerpt}</p>
              <span className="mt-5 text-xs font-medium text-stone-700">阅读全文 →</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
