import Link from "next/link";
import { createClient } from "@/lib/supabase/serverClient";
import { redirect } from "next/navigation";
import { getRandomWords, listWords } from "@/features/words/lib/wordsRepo";
import { getWordSubjectLabel, parseWordSubject, wordSubjects } from "@/features/words/lib/wordLabels";
import QuizWrapper from "@/components/QuizWrapper";
import QuizSettings from "@/components/QuizSettings";

function normalizeLimit(limitParam: string | string[] | undefined) {
  if (limitParam === "all") return "all" as const;
  if (Array.isArray(limitParam)) limitParam = limitParam[0];
  const parsed = Number(limitParam ?? "");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
}

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ limit?: string | string[]; category?: string | string[] }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { category: categoryParam } = await searchParams;
  const subject = parseWordSubject(categoryParam);
  const category = subject === "all" ? undefined : subject;

  const wordsResult = await listWords(supabase, category);
  if (!wordsResult.ok) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <p>エラーが発生しました: {wordsResult.error}</p>
        </div>
      </div>
    );
  }

  const words = wordsResult.data;
  if (words.length === 0) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="text-sm font-semibold">対象の単語が登録されていないため、クイズを開始できません。</div>
        <div className="mt-2 text-xs text-zinc-600">まずは単語を追加してから、再度クイズに挑戦してください。</div>
      </div>
    );
  }

  const { limit: limitParam } = await searchParams;
  if (limitParam == null) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500">ENGLISH MEMO</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">クイズ設定</h1>
              <p className="mt-1 text-xs text-zinc-500">出題数を入力してから、クイズをはじめましょう。</p>
            </div>
            <Link
              href="/words"
              className="h-10 shrink-0 rounded-full border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              一覧へ
            </Link>
          </header>

          <div className="mt-4 flex flex-wrap gap-2">
            {wordSubjects.map((option) => (
              <Link
                key={option.key}
                href={`/quiz?category=${option.key}`}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  subject === option.key
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>

          <QuizSettings maxCount={words.length} category={category} />

          <footer className="mt-6 text-center text-xs text-zinc-500">
            <Link href="/" className="font-semibold text-zinc-800 hover:underline">
              ← ホーム
            </Link>
          </footer>
        </div>
      </div>
    );
  }

  const limit = normalizeLimit(limitParam);

  const res = await getRandomWords(supabase, limit, category);
  if (!res.ok) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <p>エラーが発生しました: {res.error}</p>
        </div>
      </div>
    );
  }

  const randomWords = res.data;

  return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500">ENGLISH MEMO</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">クイズ ({getWordSubjectLabel(subject)})</h1>
              <p className="mt-1 text-xs text-zinc-500">指定した出題数でランダムに出題します。</p>
            </div>
            <Link
              href="/words"
              className="h-10 shrink-0 rounded-full border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              一覧へ
            </Link>
          </header>

          <QuizWrapper words={randomWords} allWords={words} />

          <footer className="mt-6 text-center text-xs text-zinc-500">
            <Link href="/" className="font-semibold text-zinc-800 hover:underline">
              ← ホーム
            </Link>
          </footer>
        </div>
      </div>
  );
}
