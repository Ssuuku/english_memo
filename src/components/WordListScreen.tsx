"use client";

import { useEffect, useMemo, useState } from "react";
import type { Word } from "@/features/words/types";
import { getScoreRank } from "@/features/words/lib/scoreRank";
import WordListItem from "@/components/WordListItem";

const rankOptions = [
  { value: "all", label: "すべて" },
  { value: "宿敵", label: "宿敵" },
  { value: "要警戒", label: "要警戒" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
];

const sortOptions = [
  { value: "created_desc", label: "登録順（新しい順）" },
  { value: "created_asc", label: "登録順（古い順）" },
  { value: "term_asc", label: "英単語 A-Z" },
  { value: "term_desc", label: "英単語 Z-A" },
  { value: "score_desc", label: "スコア順（高い順）" },
  { value: "score_asc", label: "スコア順（低い順）" },
];

export type WordListScreenProps = {
  words: Word[];
};

export default function WordListScreen({ words }: WordListScreenProps) {
  const [query, setQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [sortKey, setSortKey] = useState("created_desc");
  const [wordList, setWordList] = useState(words);

  useEffect(() => {
    setWordList(words);
  }, [words]);

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return wordList
      .filter((word) => {
        if (selectedRank !== "all") {
          const rankLabel = getScoreRank(word.score ?? 0).label;
          if (rankLabel !== selectedRank) return false;
        }

        if (!normalizedQuery) return true;

        const searchable = [word.term, word.meaning ?? "", word.memo ?? ""].join(" ").toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "created_asc":
            return (a.created_at ?? "").localeCompare(b.created_at ?? "");
          case "created_desc":
            return (b.created_at ?? "").localeCompare(a.created_at ?? "");
          case "term_asc":
            return a.term.localeCompare(b.term);
          case "term_desc":
            return b.term.localeCompare(a.term);
          case "score_asc":
            return (a.score ?? 0) - (b.score ?? 0);
          case "score_desc":
            return (b.score ?? 0) - (a.score ?? 0);
          default:
            return 0;
        }
      });
  }, [wordList, query, selectedRank, sortKey]);

  const handleDelete = (id: string) => {
    setWordList((current) => current.filter((word) => word.id !== id));
  };

  const handleUpdate = (updatedWord: Word) => {
    setWordList((current) => current.map((word) => (word.id === updatedWord.id ? updatedWord : word)));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="block">
          <span className="text-xs font-semibold text-zinc-500">検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="英単語・意味・メモを検索"
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-zinc-500">並び順</span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {rankOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedRank(option.value)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              selectedRank === option.value
                ? "bg-sky-500 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
        {filteredWords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold">該当する単語が見つかりません。</p>
            <p className="mt-2 text-xs text-zinc-500">検索ワードやランクの絞り込みを確認してください。</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-2 text-xs text-zinc-500">
              <p>{filteredWords.length} 件の単語を表示中</p>
              {selectedRank !== "all" && <p>ランク: {selectedRank}</p>}
            </div>
            <ul className="grid gap-2">
              {filteredWords.map((word) => (
                <WordListItem key={word.id} word={word} onDelete={handleDelete} onUpdate={handleUpdate} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
