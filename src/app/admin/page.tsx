import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPost } from "./actions";
import PriceToggle from "./PriceToggle";
import DeletePostButton from "./DeletePostButton";
import { prisma } from "@/lib/prisma";

// auth() 依赖 cookie，显式声明为动态渲染
export const dynamic = "force-dynamic";

const navItems = ["仪表盘", "写文章", "文章管理"];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-stretch bg-stone-100">
      {/* 左侧固定宽度 Sidebar：小屏隐藏，纯黑 + 毛玻璃层次 */}
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden bg-stone-900 px-6 py-8 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold ring-1 ring-white/15 backdrop-blur-md">
            砚
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Inkstone Admin</p>
            <p className="mt-0.5 text-[11px] text-white/40">内容管理后台</p>
          </div>
        </div>

        <p className="relative mt-12 px-3 text-[10px] font-medium uppercase tracking-[0.24em] text-white/30">
          Workspace
        </p>
        <nav className="relative mt-3 space-y-1.5">
          {navItems.map((item) => {
            const active = item === "写文章";
            return (
              <span
                key={item}
                className={
                  active
                    ? "flex items-center gap-3 rounded-2xl bg-white/15 px-3 py-3 text-sm font-medium text-white ring-1 ring-white/10 backdrop-blur-md"
                    : "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white/80"
                }
              >
                <span
                  className={active ? "h-1.5 w-1.5 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/25"}
                />
                {item}
              </span>
            );
          })}
        </nav>

        <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Signed in</p>
          <p className="mt-2 truncate text-xs text-white/80">{session.user.email}</p>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="relative min-w-0 flex-1 overflow-hidden px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-white/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/3 top-72 h-72 w-72 rounded-full bg-stone-200/60 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          {/* 小屏：侧边栏折叠为顶部条 */}
          <div className="mb-8 flex items-center justify-between rounded-2xl bg-stone-900 px-5 py-4 text-white lg:hidden">
            <span className="text-sm font-semibold tracking-tight">Inkstone Admin</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white/80">写文章</span>
          </div>

          <header className="mb-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-stone-400">
              Compose · 创作
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              创作中心
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
              把值得读的文字写下来，填写以下信息即可发布到首页。
            </p>
          </header>

          {/* 已发布文章列表 */}
          <section className="mb-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">已发布文章</h2>
                <p className="mt-1 text-xs text-stone-400">共 {posts.length} 篇 · 点击编辑或删除</p>
              </div>
            </div>

            {posts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-10 text-center text-sm text-stone-500">
                还没有文章，先在下方写第一篇吧
              </p>
            ) : (
              <ul className="space-y-3">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/70 bg-stone-50 px-5 py-4 transition hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">{post.title}</p>
                      <p className="mt-1 text-[11px] text-stone-400">
                        {formatDate(post.createdAt)}
                        {post.isPremium && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            付费
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs transition hover:border-stone-900"
                      >
                        编辑
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bento Grid：表单主卡 + 侧边提示卡 */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-10 xl:col-span-2">
              <div className="mb-9 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-stone-900">新建文章</h2>
                  <p className="mt-1 text-xs text-stone-400">带 * 的字段为必填</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-medium text-stone-500">
                  Draft → Published
                </span>
              </div>

              <form action={createPost} className="space-y-7">
                <div>
                  <label htmlFor="title" className="mb-2.5 block text-xs font-medium tracking-wide text-stone-500">
                    标题 *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="请输入文章标题"
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
                    placeholder="一句话概括这篇文章"
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
                    placeholder={"第一段……\n\n第二段……\n\n第三段……"}
                    className="min-h-[420px] w-full resize-y rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
                  />
                  <p className="mt-2 text-[11px] text-stone-400">用空行分段；前两段作为免费试读内容。</p>
                </div>

                {/* 付费开关 + 价格：仅在勾选「付费文章」时展示价格输入框 */}
                <PriceToggle />

                <div className="flex justify-end border-t border-stone-100 pt-6">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-stone-900 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-900/15 sm:w-auto"
                  >
                    发布文章
                  </button>
                </div>
              </form>
            </section>

            <aside className="flex flex-col gap-6">
              <div className="rounded-3xl bg-stone-900 p-7 text-white shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">Tip 01</p>
                <h3 className="mt-4 text-base font-semibold">先给结论，再给论证</h3>
                <p className="mt-3 text-xs leading-6 text-white/60">
                  前两段是读者唯一免费看到的内容，把最值得读的部分放在这里。
                </p>
                <div className="mt-7 h-px w-full bg-white/10" />
                <p className="mt-5 text-[11px] text-white/40">发布后立即出现在首页</p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/70 p-7 shadow-sm backdrop-blur-xl">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400">Tip 02</p>
                <h3 className="mt-4 text-base font-semibold text-stone-900">正文用空行分段</h3>
                <p className="mt-3 text-xs leading-6 text-stone-500">
                  详情页会按换行自动拆段，长文也能保持舒适的阅读节奏。
                </p>
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2.5 text-[11px] text-stone-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  空行 · 段落分隔
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
