import type { NewWordInput, Word, WordCategory } from "@/features/words/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type UnknownRow = Record<string, unknown>;

/**
 * "Repository" layer for words.
 *
 * Intent:
 * - Keep all Supabase table access in one place.
 * - Pages/components call these functions instead of calling Supabase directly.
 * - Makes it easy to switch to server actions / RLS / auth later without rewriting UI.
 */

export type RepoResult<T> = { ok: true; data: T } | { ok: false; error: string };

function normalizeInput(input: NewWordInput): {
  term: string;
  meaning: string | null;
  memo: string | null;
  category: "english" | "kobun" | "kanbun";
  reading: string | null;
  supplement: string | null;
} | RepoResult<never> {
  const term = input.term.trim();
  if (!term) return { ok: false, error: "英単語（term）は必須です。" };
  if (term.length > 64) return { ok: false, error: "英単語が長すぎます（64文字以内）。" };

  const rawMeanings = [
    ...(Array.isArray(input.meanings) ? input.meanings : []),
    input.meaning ?? "",
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueMeanings = Array.from(new Set(rawMeanings));
  const meaning = uniqueMeanings.length > 0 ? uniqueMeanings.join("\n") : null;
  const memo = (input.memo ?? "").trim();
  const category = input.category ?? "english";
  const reading = (input.reading ?? "").trim();
  const supplement = (input.supplement ?? "").trim();

  return {
    term,
    meaning,
    memo: memo ? memo : null,
    category,
    reading: reading ? reading : null,
    supplement: supplement ? supplement : null,
  };
}

export async function listWords(client: SupabaseClient, category?: WordCategory): Promise<RepoResult<Word[]>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const query = client
    .from("words")
    .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, kanbun_annotations, created_at")
    .eq("user_id", user.id);

  if (category) {
    query.eq("category", category);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      let fallbackQuery = client
        .from("words")
        .select("id, term, meaning, memo, created_at")
        .eq("user_id", user.id);

      if (category) {
        fallbackQuery = fallbackQuery.eq("category", category);
      }

      const fallback = await fallbackQuery.order("created_at", { ascending: false });
      if (fallback.error) return { ok: false, error: fallback.error.message };
      return {
        ok: true,
        data: (fallback.data ?? []).map((item: UnknownRow) => ({
          ...item,
          score: 0,
          correct_count: 0,
          wrong_count: 0,
          category: "english",
          reading: null,
          supplement: null,
          kanbun_annotations: null,
        })) as Word[],
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: (data ?? []) as Word[] };
}

export async function createWord(client: SupabaseClient, input: NewWordInput): Promise<RepoResult<Word>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const normalized = normalizeInput(input);
  if ("ok" in normalized) return normalized;

  /**
   * We insert minimal columns only.
   *
   * Why:
   * - Early in development, the table may evolve (e.g., adding user_id later).
   * - Keeping insert payload small reduces "schema mismatch" failures.
   */
  const insertData = {
    term: normalized.term,
    meaning: normalized.meaning,
    memo: normalized.memo,
    score: 0,
    correct_count: 0,
    wrong_count: 0,
    category: normalized.category,
    reading: normalized.reading,
    supplement: normalized.supplement,
    kanbun_annotations: (input.kanbun_annotations as unknown) ?? null,
    user_id: user.id,
  };

  const { data, error } = await client
    .from("words")
    .insert(insertData)
    .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, kanbun_annotations, created_at")
    .single();

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      const fallbackInsertData = {
        term: normalized.term,
        meaning: normalized.meaning,
        memo: normalized.memo,
        category: normalized.category,
        reading: normalized.reading,
        supplement: normalized.supplement,
        kanbun_annotations: (input.kanbun_annotations as unknown) ?? null,
        user_id: user.id,
      };
      const fallback = await client
        .from("words")
        .insert(fallbackInsertData)
        .select("id, term, meaning, memo, category, reading, supplement, kanbun_annotations, created_at")
        .single();
      if (fallback.error) return { ok: false, error: fallback.error.message };
      return { ok: true, data: { ...(fallback.data as Word), score: 0, correct_count: 0, wrong_count: 0 } as Word };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: data as Word };
}

export async function updateWord(client: SupabaseClient, id: string, input: NewWordInput): Promise<RepoResult<Word>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const normalized = normalizeInput(input);
  if ("ok" in normalized) return normalized;

  const { data, error } = await client
    .from("words")
    .update({
      term: normalized.term,
      meaning: normalized.meaning,
      memo: normalized.memo,
      category: normalized.category,
      reading: normalized.reading,
      supplement: normalized.supplement,
      kanbun_annotations: (input.kanbun_annotations as unknown) ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, kanbun_annotations, created_at")
    .single();

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      const fallback = await client
        .from("words")
        .update({
          term: normalized.term,
          meaning: normalized.meaning,
          memo: normalized.memo,
          category: normalized.category,
          reading: normalized.reading,
          supplement: normalized.supplement,
          kanbun_annotations: (input.kanbun_annotations as unknown) ?? null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, term, meaning, memo, category, reading, supplement, kanbun_annotations, created_at")
        .single();
      if (fallback.error) return { ok: false, error: fallback.error.message };
      return { ok: true, data: { ...(fallback.data as Word), score: 0, correct_count: 0, wrong_count: 0 } as Word };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: data as Word };
}

export async function updateWordStats(
  client: SupabaseClient,
  id: string,
  stats: { scoreDelta?: number; correctDelta?: number; wrongDelta?: number }
): Promise<RepoResult<Word>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const increments: Record<string, number> = {};
  if (typeof stats.scoreDelta === "number") increments.score = stats.scoreDelta;
  if (typeof stats.correctDelta === "number") increments.correct_count = stats.correctDelta;
  if (typeof stats.wrongDelta === "number") increments.wrong_count = stats.wrongDelta;

  if (Object.keys(increments).length === 0) {
    const { data, error } = await client
      .from("words")
      .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, kanbun_annotations, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.message?.includes("column") && error.message?.includes("does not exist")) {
        const fallback = await client
          .from("words")
          .select("id, term, meaning, memo, created_at")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (fallback.error) return { ok: false, error: fallback.error.message };
        return {
          ok: true,
          data: {
            ...(fallback.data as Word),
            score: 0,
            correct_count: 0,
            wrong_count: 0,
            category: "english",
            reading: null,
            supplement: null,
            kanbun_annotations: null,
          } as Word,
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, data: data as Word };
  }

  // Get current values first
  const { data: currentData, error: selectError } = await client
    .from("words")
    .select("score, correct_count, wrong_count")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (selectError) {
    if (selectError.message?.includes("column") && selectError.message?.includes("does not exist")) {
      const fallback = await client
        .from("words")
        .select("id, term, meaning, memo, created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (fallback.error) return { ok: false, error: fallback.error.message };
      return { ok: true, data: { ...(fallback.data as Word), score: 0, correct_count: 0, wrong_count: 0 } as Word };
    }
    return { ok: false, error: selectError.message };
  }

  // Calculate new values
  const newScore = (currentData.score || 0) + (increments.score || 0);
  const newCorrectCount = (currentData.correct_count || 0) + (increments.correct_count || 0);
  const newWrongCount = (currentData.wrong_count || 0) + (increments.wrong_count || 0);

  // Update with new values
  const { data, error } = await client
    .from("words")
    .update({
      score: newScore,
      correct_count: newCorrectCount,
      wrong_count: newWrongCount,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, kanbun_annotations, created_at")
    .single();

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      const fallback = await client
        .from("words")
        .select("id, term, meaning, memo, created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (fallback.error) return { ok: false, error: fallback.error.message };
      return {
        ok: true,
        data: {
          ...(fallback.data as Word),
          score: 0,
          correct_count: 0,
          wrong_count: 0,
          category: "english",
          reading: null,
          supplement: null,
        } as Word,
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: data as Word };
}

export async function deleteWord(client: SupabaseClient, id: string): Promise<RepoResult<null>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const { error } = await client
    .from("words")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}

/**
 * ランダムに指定数の単語を取得
 * @param client Supabase client
 * @param limit 取得する単語数（'all' で全て取得）
 */
export async function getRandomWords(client: SupabaseClient, limit: number | 'all', category?: WordCategory): Promise<RepoResult<Word[]>> {
  if (!client) return { ok: false, error: "Supabase client 初期化に失敗しました（.env.local を確認）。" };

  if (typeof limit === "number" && (!Number.isInteger(limit) || limit <= 0)) {
    return { ok: false, error: "クイズの問題数が不正です。" };
  }

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です。" };

  const query = client
    .from("words")
    .select("id, term, meaning, memo, score, correct_count, wrong_count, category, reading, supplement, created_at")
    .eq("user_id", user.id);

  if (category) {
    query.eq("category", category);
  }

  const { data, error } = await query;
  let words = (data ?? []) as Word[];
  if (error) {
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      let fallbackQuery = client
        .from("words")
        .select("id, term, meaning, memo, created_at")
        .eq("user_id", user.id);

      if (category) {
        fallbackQuery = fallbackQuery.eq("category", category);
      }

      const fallback = await fallbackQuery;
      if (fallback.error) return { ok: false, error: fallback.error.message };
      words = (fallback.data ?? []).map((item: UnknownRow) => ({
        ...item,
        score: 0,
        correct_count: 0,
        wrong_count: 0,
        category: "english",
        reading: null,
        supplement: null,
      })) as Word[];
    } else {
      return { ok: false, error: error.message };
    }
  }

  function shuffle<T>(items: T[]): T[] {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  if (limit === 'all') {
    const weighted = [...words].sort((a, b) => a.score - b.score);
    const weightedSize = Math.ceil(weighted.length * 0.7);
    const lowScoreWords = weighted.slice(0, weightedSize);
    const restWords = shuffle(weighted.slice(weightedSize));
    return { ok: true, data: shuffle([...lowScoreWords, ...restWords]) };
  }

  if (limit >= words.length) {
    const weighted = [...words].sort((a, b) => a.score - b.score);
    const weightedSize = Math.ceil(weighted.length * 0.7);
    const lowScoreWords = weighted.slice(0, weightedSize);
    const restWords = shuffle(weighted.slice(weightedSize));
    return { ok: true, data: shuffle([...lowScoreWords, ...restWords]) };
  }

  const weighted = [...words].sort((a, b) => a.score - b.score);
  const weightedCount = Math.min(Math.max(1, Math.ceil(limit * 0.7)), weighted.length);
  const lowScoreWords = weighted.slice(0, weightedCount);
  const remainingCandidates = shuffle(weighted.slice(weightedCount));
  const remaining = remainingCandidates.slice(0, limit - lowScoreWords.length);
  return { ok: true, data: shuffle([...lowScoreWords, ...remaining]) };
}

