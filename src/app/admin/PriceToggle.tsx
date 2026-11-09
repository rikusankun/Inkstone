"use client";

import { useState } from "react";

type Props = {
  defaultPremium?: boolean;
  defaultPrice?: number;
};

// 客户端小组件：管理「付费文章」开关状态，仅当勾选时才展示价格输入框。
// name / value 与 Server Action 的读取逻辑保持一致（isPremium="on"，price 数字）。
export default function PriceToggle({ defaultPremium = false, defaultPrice = 1 }: Props) {
  const [isPremium, setIsPremium] = useState(defaultPremium);

  return (
    <>
      <label className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl border border-stone-200/70 bg-stone-50 px-5 py-4 transition hover:bg-white focus-within:ring-4 focus-within:ring-stone-900/5">
        <input
          type="checkbox"
          name="isPremium"
          value="on"
          checked={isPremium}
          onChange={(event) => setIsPremium(event.target.checked)}
          className="peer sr-only"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-stone-900">设为付费文章</span>
          <span className="mt-1 block text-xs leading-5 text-stone-500">
            开启后前两段免费，其余内容需付费解锁
          </span>
        </span>
        <span
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
            isPremium ? "bg-stone-900" : "bg-stone-300"
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isPremium ? "translate-x-5" : ""
            }`}
          />
        </span>
      </label>

      {isPremium && (
        <div>
          <label htmlFor="price" className="mb-2.5 block text-xs font-medium tracking-wide text-stone-500">
            价格（元）
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            defaultValue={defaultPrice}
            required
            placeholder="1"
            className="w-full rounded-xl border border-stone-200/80 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
          />
          <p className="mt-2 text-[11px] text-stone-400">仅付费文章需要设置价格，读者支付后解锁全文。</p>
        </div>
      )}
    </>
  );
}
