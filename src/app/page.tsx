import Image from "next/image";
import { createClient } from "@/lib/supabase/serverClient";
import Auth from "@/components/Auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-zinc-50 via-white to-sky-50 text-zinc-950 flex items-center justify-center">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-50 via-white to-sky-50 text-zinc-950">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700">ENGLISH MEMO</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">英単語・弱点克服</h1>
            <p className="mt-1 text-xs text-zinc-500">間違えた単語を集めて、復習しやすく。</p>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton />
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 ring-1 ring-sky-100 shadow-sm">
              <Image src="/next.svg" alt="" width={24} height={24} priority className="opacity-70" />
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
          <h2 className="text-sm font-extrabold tracking-tight text-zinc-800">はじめに</h2>
          <p className="mt-2 text-sm text-zinc-600">
            まずは <span className="font-semibold">単語登録</span> と <span className="font-semibold">一覧</span>{" "}
            を作って、アプリの形を確認します。辞書補完とクイズはこの後に追加します。
          </p>

          <div className="mt-4 grid gap-2">
            <a
              href="/words/new"
              className="h-12 w-full rounded-2xl bg-zinc-950 text-sm font-extrabold text-white shadow-sm grid place-items-center transition hover:bg-zinc-900"
            >
              単語を追加
            </a>
            <a
              href="/words"
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white text-sm font-extrabold text-zinc-900 shadow-sm grid place-items-center transition hover:bg-zinc-50"
            >
              単語一覧を見る
            </a>
            <a
              href="/quiz"
              className="h-12 w-full rounded-2xl border border-sky-200 bg-sky-50 text-sm font-extrabold text-sky-900 shadow-sm grid place-items-center transition hover:bg-sky-100"
            >
              クイズに挑戦
            </a>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
          <h2 className="text-sm font-extrabold tracking-tight text-zinc-800">開発者向け</h2>
          <div className="mt-3 grid gap-2">
            <a
              href="/debug/supabase"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 grid place-items-center hover:bg-zinc-50"
            >
              Supabase 接続テスト
            </a>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-zinc-500">
          <span className="font-semibold">Next.js</span> + <span className="font-semibold">Supabase</span>
        </footer>
      </div>
    </div>
  );
}
