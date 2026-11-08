"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email", { email, redirect: false });
      if (result?.error) setError(`登录链接生成失败：${result.error}`);
      else setSent(true);
    } catch {
      setError("请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">登录 Inkstone</h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        输入邮箱，我们会生成一条一次性登录链接。本骨架不发真实邮件。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "生成中…" : "发送登录链接"}
        </button>
      </form>

      {sent && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          请查看终端 —— 登录链接已打印在运行 <code className="font-mono">npm run dev</code> 的终端里，
          复制粘贴到浏览器即可完成登录。
        </div>
      )}
      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
