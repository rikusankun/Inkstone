"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemCode } from "./actions";

// 兑换码输入框：调用 redeemCode Server Action，成功后刷新页面解锁全文
export default function RedeemCodeForm({ postId }: { postId: string }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await redeemCode(postId, code);
        if (!result.ok) {
          setMessage({ type: "error", text: result.error });
          return;
        }
        setMessage({
          type: "success",
          text: result.alreadyUnlocked
            ? "本文已解锁，无需再次兑换（该兑换码未被核销）"
            : "兑换成功，全文已解锁！",
        });
        setCode("");
        router.refresh();
      } catch {
        setMessage({ type: "error", text: "兑换失败，请稍后重试" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <label
        htmlFor="redeem-code"
        className="mb-2 block text-xs font-medium tracking-wide text-stone-500"
      >
        输入兑换码
      </label>
      <div className="flex gap-2">
        <input
          id="redeem-code"
          name="code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="INK-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
          className="w-full rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3 text-sm uppercase tracking-widest text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
        />
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="shrink-0 rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-40"
        >
          {pending ? "兑换中…" : "兑换"}
        </button>
      </div>

      {message && (
        <p
          className={
            message.type === "error"
              ? "mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              : "mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800"
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
