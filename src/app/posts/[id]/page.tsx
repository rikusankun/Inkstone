import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// 避免构建期预渲染时访问数据库
export const dynamic = "force-dynamic";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

// Next.js 14：params 为同步对象（Next.js 15+ 才是 Promise）
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  // 数据库 content 是单个字符串，按换行拆段；兼容 CRLF 与连续空行
  const paragraphs = post.content
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const freePart = paragraphs.slice(0, 2);
  const lockedPart = paragraphs.slice(2);
  const readTime = Math.max(1, Math.ceil(post.content.length / 400));

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-xs text-stone-400 hover:text-stone-700">
        ← 返回首页
      </Link>

      <header className="mt-8 border-b border-stone-200 pb-8">
        <div className="flex items-center gap-3">
          {post.isPremium && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              付费文章 · ¥1
            </span>
          )}
          <span className="text-xs text-stone-400">
            {formatDate(post.createdAt)} · 约 {readTime} 分钟
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900">{post.title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">{post.excerpt}</p>
      </header>

      {/* 上半部分：免费试读（前两段） */}
      <div className="mt-8 space-y-5 text-[17px] leading-8 text-stone-700">
        {freePart.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* 下半部分：仅付费文章用 absolute + backdrop-blur 遮罩 */}
      {post.isPremium ? (
        <div className="relative mt-8 min-h-[340px] overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div
            aria-hidden="true"
            className="select-none space-y-5 p-8 text-[17px] leading-8 text-stone-400"
          >
            {lockedPart.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/55 px-6 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white/95 px-8 py-8 text-center shadow-xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Premium</p>
              <h2 className="mt-3 text-xl font-semibold text-stone-900">以下内容需解锁</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">支付 1 元，永久阅读本文完整内容</p>
              {/* 骨架占位：支付与权益校验尚未接入，后续在此调用下单 API */}
              <button
                type="button"
                className="mt-6 w-full rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                支付 1 元解锁
              </button>
              <p className="mt-3 text-xs text-stone-400">支付流程待接入（骨架占位）</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-5 text-[17px] leading-8 text-stone-700">
          {lockedPart.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
    </article>
  );
}
