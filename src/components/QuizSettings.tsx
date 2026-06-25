"use client";

import { useState } from "react";
import Link from "next/link";

type QuizSettingsProps = {
  maxCount: number;
  category?: string;
};

export default function QuizSettings({ maxCount, category }: QuizSettingsProps) {
  const initialCount = maxCount > 0 ? Math.min(10, maxCount) : 0;
  const [count, setCount] = useState(initialCount);
  const href = category ? `/quiz?limit=${count}&category=${category}` : `/quiz?limit=${count}`;

  console.log("QuizSettings render:", { count, maxCount, href });

  return (
    <section className="mt-5 rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
      <div className="mb-5 text-center">
        <p className="text-xs font-semibold text-zinc-500">出題数を設定してから開始します</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950">クイズ設定</h2>
      </div>

      {maxCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center">
          <p className="text-sm font-semibold">まだ単語が登録されていません。</p>
          <p className="mt-2 text-xs text-zinc-600">単語を登録するとクイズを開始できます。</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-zinc-700" htmlFor="quiz-count">
              出題数
            </label>
            <div className="mt-3 flex items-center gap-3">
              <input
                id="quiz-count"
                type="number"
                min={1}
                max={maxCount}
                value={count}
                onChange={(event) => setCount(Math.max(1, Math.min(maxCount, Number(event.target.value))))}
                className="w-24 rounded-2xl border border-zinc-200 bg-slate-50 px-3 py-2 text-right text-sm text-zinc-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="text-sm text-zinc-600">/ {maxCount} 問</span>
            </div>
          </div>

          <div>
            <input
              type="range"
              min={1}
              max={maxCount}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="text-xs text-zinc-500 text-center">
            遷移先: {href}
          </div>

          {count >= 1 && count <= maxCount ? (
            <Link
              href={href}
              onClick={() => console.log("Link clicked:", { count, href })}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              {maxCount === 1 ? "1問でクイズを開始" : `${count}問でクイズを開始`}
            </Link>
          ) : (
            <div className="inline-flex w-full items-center justify-center rounded-3xl bg-zinc-300 px-4 py-3 text-sm font-semibold text-white shadow-sm">
              {maxCount === 1 ? "1問でクイズを開始" : `${count}問でクイズを開始`}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
