import Link from "next/link";
import { createClient } from "@/lib/supabase/serverClient";
import { listWords } from "@/features/words/lib/wordsRepo";
import { parseWordSubject, wordSubjects } from "@/features/words/lib/wordLabels";
import { redirect } from "next/navigation";
import WordListScreen from "@/components/WordListScreen";

export default async function WordsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { category: categoryParam } = await searchParams;
  const subject = parseWordSubject(categoryParam);
  const category = subject === "all" ? undefined : subject;

  const res = await listWords(supabase, category);
  if (!res.ok) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950">
        <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
          <p>エラーが発生しました: {res.error}</p>
        </div>
      </div>
    );
  }
  const words = res.data;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 shadow-sm transition hover:bg-zinc-200"
            aria-label="ホームへ戻る"
            title="ホームへ戻る"
          >
            ←
          </Link>
          <div className="flex-1 px-4">
            <p className="text-xs font-semibold tracking-wide text-zinc-500">ENGLISH MEMO</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">単語一覧</h1>
            <p className="mt-1 text-xs text-zinc-500">間違えた単語を貯めて、あとで一気に復習。</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/quiz"
              className="h-11 rounded-2xl bg-sky-500 px-4 text-white shadow-sm transition hover:bg-sky-600 flex items-center justify-center text-sm font-semibold"
              title="クイズに挑戦"
            >
              クイズに挑戦
            </Link>
            <Link
              href={subject === "all" ? "/words/new" : `/words/new?category=${subject}`}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white shadow-sm transition hover:bg-zinc-900"
              aria-label="単語を追加"
              title="単語を追加"
            >
              <span className="text-xl leading-none">+</span>
            </Link>
          </div>
        </header>

        <section className="mt-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {wordSubjects.map((option) => (
              <Link
                key={option.key}
                href={`/words?category=${option.key}`}
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

          {words.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4">
              <p className="text-sm font-semibold">まだ単語がありません。</p>
              <p className="mt-1 text-xs text-zinc-600">右上の + から登録してみてください。</p>
            </div>
          ) : (
            <WordListScreen words={words} />
          )}
        </section>
      </div>
    </div>
  );
}
