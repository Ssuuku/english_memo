"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

type TestResult = {
  ok: boolean;
  label: string;
  detail: unknown;
};

function pretty(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function SupabaseDebugPage() {
  const client = useMemo(() => createClient(), []);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);

    if (!client) {
      setResults([
        {
          ok: false,
          label: "Init",
          detail:
            "Supabase client could not be created. Check NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY and restart dev server.",
        },
      ]);
      setRunning(false);
      return;
    }

    const next: TestResult[] = [];

    // Test 1: Auth endpoint reachability (even without login).
    try {
      const res = await client.auth.getSession();
      next.push({ ok: true, label: "auth.getSession()", detail: res });
    } catch (e) {
      next.push({ ok: false, label: "auth.getSession()", detail: e });
    }

    // Test 2: A minimal database call.
    // This may fail with RLS/permission errors (that’s fine for now).
    // The key is: we want to see a *structured Supabase error*, not "Failed to fetch".
    try {
      const res = await client.from("words").select("id, term").limit(1);
      next.push({
        ok: !res.error,
        label: "from('words').select().limit(1)",
        detail: res,
      });
    } catch (e) {
      next.push({ ok: false, label: "from('words').select().limit(1)", detail: e });
    }

    setResults(next);
    setRunning(false);
  }, [client]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6">
        <header>
          <p className="text-xs font-semibold tracking-wide text-zinc-500">DEBUG</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Supabase connection test</h1>
          <p className="mt-2 text-sm text-zinc-600">
            If you see <span className="font-semibold">TypeError: Failed to fetch</span>, it’s usually a URL/protocol/CORS/network
            issue. If you see a Supabase error object, the network is OK.
          </p>
        </header>

        <div className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-zinc-100 shadow-sm">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running}
            className="h-12 w-full rounded-2xl bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-900 disabled:opacity-60"
          >
            {running ? "Running..." : "Run tests"}
          </button>

          {results.length ? (
            <div className="mt-4 grid gap-3">
              {results.map((r) => (
                <section
                  key={r.label}
                  className={`rounded-2xl px-3 py-3 ring-1 ${
                    r.ok ? "bg-emerald-50 ring-emerald-100" : "bg-rose-50 ring-rose-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-extrabold">{r.label}</h2>
                    <span className={`text-xs font-bold ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
                      {r.ok ? "OK" : "NG"}
                    </span>
                  </div>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-white/60 p-3 text-[11px] leading-4 text-zinc-800">
                    {pretty(r.detail)}
                  </pre>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Tip: create the <code className="font-semibold">words</code> table first, or you’ll see “relation does not exist”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

