import Link from "next/link";
import { createClient } from "@/lib/supabase/serverClient";
import { redirect } from "next/navigation";
import NewWordForm from "@/components/NewWordForm";

export default async function NewWordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-zinc-500">ENGLISH MEMO</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">単語を追加</h1>
            <p className="mt-1 text-xs text-zinc-500">まずは手入力でOK。辞書の自動補完は次のステップで追加します。</p>
          </div>
          <Link
            href="/words"
            className="h-10 shrink-0 rounded-full border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            一覧へ
          </Link>
        </header>

        <NewWordForm />

        <footer className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="font-semibold text-zinc-800 hover:underline">
            ← ホーム
          </Link>
        </footer>
      </div>
    </div>
  );
}

