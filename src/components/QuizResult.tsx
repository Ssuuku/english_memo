"use client";

import Link from "next/link";

export type RankChange = {
  term: string;
  before: string;
  after: string;
  delta: number;
};

export type QuizResultData = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  wrongWords: { term: string; correctMeaning: string; userAnswer: string }[];
  rankChanges: RankChange[];
};

type QuizResultProps = {
  result: QuizResultData;
  onRestart?: () => void; // kept for compatibility
  onRestartSameCount?: (count: number) => void;
};

export default function QuizResult({ result, onRestart, onRestartSameCount }: QuizResultProps) {
  const { totalQuestions, correctAnswers, score, wrongWords, rankChanges } = result;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const rankUpCount = rankChanges.filter((change) => change.delta > 0).length;
  const rankDownCount = rankChanges.filter((change) => change.delta < 0).length;

  return (
    <section className="mt-5 rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
      <div className="text-center">
        <h2 className="text-xl font-extrabold tracking-tight">クイズ結果</h2>
        <div className="mt-4 space-y-2">
          <p className="text-3xl font-bold text-sky-600">
            {correctAnswers} / {totalQuestions} 問正解
          </p>
          <p className="text-sm text-zinc-600">
            正解率: {accuracy}%
          </p>
          <p className="text-sm text-zinc-600">
            スコア: {score > 0 ? `+${score}` : score}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold text-zinc-500">ランクアップ</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{rankUpCount}</p>
        </div>
        <div className="rounded-3xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold text-zinc-500">ランクダウン</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">{rankDownCount}</p>
        </div>
      </div>

      {rankChanges.length > 0 && (
        <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <h3 className="text-sm font-bold text-zinc-700">ランク変動</h3>
          <div className="mt-3 space-y-3">
            {rankChanges.map((change, index) => (
              <div key={`${change.term}-${index}`} className="rounded-2xl bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-zinc-900">{change.term}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${change.delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {change.delta > 0 ? "+" + change.delta : change.delta}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  {change.before} → {change.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongWords.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-zinc-700">間違えた単語</h3>
          <div className="mt-3 space-y-3">
            {wrongWords.map((wrong, index) => (
              <div key={index} className="rounded-lg bg-rose-50 p-3">
                <p className="font-semibold text-rose-800">{wrong.term}</p>
                <p className="mt-1 text-xs text-rose-700">
                  正解: {wrong.correctMeaning}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  あなたの答え: {wrong.userAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="grid gap-2">
          <button
            onClick={() => {
              if (onRestartSameCount) {
                onRestartSameCount(totalQuestions);
              } else if (onRestart) {
                onRestart();
              }
            }}
            className="w-full h-12 rounded-2xl bg-sky-600 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
          >
            同じ問題数で挑戦
          </button>
          <Link
            href="/quiz"
            className="block w-full h-12 rounded-2xl bg-zinc-100 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-200 flex items-center justify-center"
          >
            問題数を変えて挑戦
          </Link>
        </div>
        <Link
          href="/words"
          className="block w-full h-12 rounded-2xl bg-zinc-100 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-200 flex items-center justify-center"
        >
          単語一覧へ
        </Link>
      </div>
    </section>
  );
}