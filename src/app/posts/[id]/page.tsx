import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RedeemCodeForm from "../RedeemCodeForm";

// 避免构建期预渲染时访问数据库
export const dynamic = "force-dynamic";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

// Next.js 14：params 为同步对象（Next.js 15+ 才是 Promise）
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  // 查询当前登录用户是否已兑换解锁本文
  const session = await auth();
  let isUnlocked = false;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (dbUser) {
      const unlock = await prisma.unlock.findUnique({
        where: { userId_postId: { userId: dbUser.id, postId: post.id } },
      });
      isUnlocked = Boolean(unlock);
    }
  }

  // 已解锁或免费文章 -> 直接展示全文；否则锁定
  const locked = post.isPremium && !isUnlocked;

  // 按「空行」切块（而不是每个换行），否则 Markdown 的列表/表格/代码块会被切碎
  const paragraphs = post.content
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const freeMarkdown = paragraphs.slice(0, 2).join("\n\n");
  const lockedMarkdown = paragraphs.slice(2).join("\n\n");
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
              付费文章 · ¥{post.price}
            </span>
          )}
          {isUnlocked && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              已解锁
            </span>
          )}
          <span className="text-xs text-stone-400">
            {formatDate(post.createdAt)} · 约 {readTime} 分钟
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900">{post.title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">{post.excerpt}</p>
      </header>

      {locked ? (
        <>
          {/* 免费试读（前两段） */}
          <div className="article-md mt-8 text-[17px] leading-8 text-stone-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{freeMarkdown}</ReactMarkdown>
          </div>

          {/* 遮罩 + 兑换区 */}
          <div className="relative mt-8 min-h-[340px] overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div
              aria-hidden="true"
              className="select-none space-y-5 p-8 text-[17px] leading-8 text-stone-400"
            >
              {/* 遮罩背后的内容用 Markdown 渲染，整体置灰 */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lockedMarkdown}</ReactMarkdown>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/55 px-6 backdrop-blur-md">
              <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white/95 px-8 py-8 text-center shadow-xl">
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Premium</p>
                <h2 className="mt-3 text-xl font-semibold text-stone-900">以下内容需解锁</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  支付 ¥{post.price}，永久阅读本文完整内容
                </p>

                {session?.user ? (
                  <>
                    <RedeemCodeForm postId={post.id} />
                    <p className="mt-3 text-xs text-stone-400">
                      已购买？向管理员索取兑换码后在此输入
                    </p>
                  </>
                ) : (
                  <div className="mt-6">
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/posts/${post.id}`)}`}
                      className="block w-full rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                    >
                      登录后使用兑换码
                    </Link>
                    <p className="mt-3 text-xs text-stone-400">
                      登录后输入兑换码即可解锁全文
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 免费文章或已解锁：全文用 Markdown 渲染 */
        <div className="article-md mt-8 text-[17px] leading-8 text-stone-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
