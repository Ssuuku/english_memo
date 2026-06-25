import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/serverClient';
import { getRandomWords } from '@/features/words/lib/wordsRepo';
import { parseWordSubject } from '@/features/words/lib/wordLabels';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit') ?? undefined;
  const categoryParam = url.searchParams.get('category') ?? undefined;
  const category = parseWordSubject(categoryParam);
  const limit: number | 'all' | undefined = limitParam === 'all' ? 'all' : limitParam ? Number(limitParam) : undefined;

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase client 初期化失敗' }, { status: 500 });

  if (limit === undefined) return NextResponse.json({ ok: false, error: 'limit パラメータが必要です' }, { status: 400 });

  const categoryFilter = category === 'all' ? undefined : category;
  const res = await getRandomWords(supabase, limit as number | 'all', categoryFilter);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 500 });

  return NextResponse.json({ ok: true, data: res.data });
}
