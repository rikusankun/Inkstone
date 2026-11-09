"use client";

import { deletePost } from "./actions";

// 客户端小组件：用原生 confirm 做二次确认，防止误删。
// deletePost 是 Server Action（"use server"），可直接作为 form 的 action 使用。
export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(event) => {
        if (!confirm(`确定删除《${title}》吗？此操作不可恢复。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-100"
      >
        删除
      </button>
    </form>
  );
}
