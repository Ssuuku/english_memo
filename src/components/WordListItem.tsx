"use client";

import { useState } from "react";
import type { Word } from "@/features/words/types";
import { deleteWord, updateWord, updateWordStats } from "@/features/words/lib/wordsRepo";
import { createClient } from "@/lib/supabase/browserClient";

import { getScoreRank } from "@/features/words/lib/scoreRank";


export type WordListItemProps = {
  word: Word;
  onDelete?: (id: string) => void;
  onUpdate?: (word: Word) => void;
};

export default function WordListItem({ word, onDelete, onUpdate }: WordListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTerm, setEditTerm] = useState(word.term);
  const initialMeanings = word.meaning?.split(/\r?\n/).filter(Boolean) ?? [""];
  const [editMeanings, setEditMeanings] = useState<string[]>(initialMeanings.length ? initialMeanings : [""]);
  const [editMemo, setEditMemo] = useState(word.memo || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdjustingScore, setIsAdjustingScore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    const client = createClient();
    const cleanedMeanings = editMeanings.map((value) => value.trim()).filter(Boolean);
    const res = await updateWord(client, word.id, {
      term: editTerm,
      meanings: cleanedMeanings,
      memo: editMemo || undefined,
    });

    setIsSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    onUpdate?.(res.data);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`「${word.term}」を削除しますか？`)) return;

    setError(null);
    setIsDeleting(true);

    const client = createClient();
    const res = await deleteWord(client, word.id);

    setIsDeleting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    onDelete?.(word.id);
  }

  async function handleAdjustScore(delta: number) {
    setError(null);
    setIsAdjustingScore(true);
    try {
      const client = createClient();
      const res = await updateWordStats(client, word.id, { scoreDelta: delta });
      if (!res.ok) {
        setError(res.error);
      } else {
        onUpdate?.(res.data);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsAdjustingScore(false);
    }
  }

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3">
        <div className="space-y-3">
          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600">スコア: <span className="font-bold text-zinc-900">{word.score ?? 0}</span></span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleAdjustScore(-1)}
                  disabled={isAdjustingScore}
                  className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 transition hover:bg-rose-200"
                  title="スコアを減らす"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => void handleAdjustScore(1)}
                  disabled={isAdjustingScore}
                  className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200"
                  title="スコアを増やす"
                >
                  ＋
                </button>
              </div>
            </div>
          <input
            type="text"
            value={editTerm}
            onChange={(e) => setEditTerm(e.target.value)}
            placeholder="英単語"
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="space-y-2">
            {editMeanings.map((value, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const next = [...editMeanings];
                    next[index] = e.target.value;
                    setEditMeanings(next);
                  }}
                  placeholder={index === 0 ? "意味" : "追加の意味"}
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {editMeanings.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setEditMeanings((current) => current.filter((_, idx) => idx !== index))}
                    className="h-11 w-11 rounded-2xl bg-rose-100 text-rose-700 transition hover:bg-rose-200"
                    aria-label="意味を削除"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setEditMeanings((current) => [...current, ""])}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
            >
              意味を追加
            </button>
          </div>
          <textarea
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="メモ"
            rows={2}
            className="w-full resize-none rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {isSaving ? "保存中…" : "保存"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              キャンセル
            </button>
          </div>
        </div>
      </li>
    );
  }

  const meaningLines = word.meaning?.split(/\r?\n/).filter(Boolean) ?? [];

  const rank = getScoreRank(word.score ?? 0);

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-extrabold tracking-tight">{word.term}</p>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${rank.color}`}>{rank.label}</span>
            <span className="text-xs text-zinc-500">スコア: {word.score ?? 0}</span>
          </div>
          {word.category === "kanbun" && word.kanbun_annotations?.length ? (
            <div className="mt-3">
              <div
                className="inline-flex gap-1 rounded-2xl bg-zinc-50 px-2 py-2"
                style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
              >
                {word.kanbun_annotations.map((annotation, index) => (
                  <div
                    key={index}
                    className="inline-grid grid-rows-[0.9rem_auto_0.9rem] items-center justify-items-center text-center"
                    style={{ minWidth: "1.4rem" }}
                  >
                    <span className="text-[10px] leading-none text-zinc-500">
                      {annotation.reading ?? ""}
                    </span>
                    <span className="text-xl font-bold leading-none">{annotation.char}</span>
                    <span className="text-[10px] leading-none text-zinc-500">
                      {annotation.kaeriten ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {meaningLines.length > 0 && (
            <div className="mt-1 space-y-1 text-sm text-zinc-700">
              {meaningLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
          {word.memo && <p className="mt-2 text-xs text-zinc-500">{word.memo}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-200"
            title="編集"
          >
            ✏️
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-200 disabled:opacity-60"
            title="削除"
          >
            🗑️
          </button>
        </div>
      </div>
    </li>
  );
}
