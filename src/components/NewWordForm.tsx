"use client";

import { useState } from "react";
import type { WordCategory } from "@/features/words/types";
import { createClient } from "@/lib/supabase/browserClient";
import { createWord } from "@/features/words/lib/wordsRepo";
import { wordSubjects, getWordFormLabels } from "@/features/words/lib/wordLabels";

type NewWordFormProps = {
  defaultCategory?: WordCategory | "all";
};

export default function NewWordForm({ defaultCategory = "english" }: NewWordFormProps) {
  const category = defaultCategory === "all" ? "english" : defaultCategory;
  const labels = getWordFormLabels(category);
  const [word, setWord] = useState("");
  const [meanings, setMeanings] = useState([""]);
  const [memo, setMemo] = useState("");
  const [reading, setReading] = useState("");
  const [supplement, setSupplement] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>(category);

  const currentLabels = getWordFormLabels(selectedCategory);

  const handleMeaningChange = (index: number, value: string) => {
    setMeanings((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  };

  const addMeaningField = () => {
    setMeanings((current) => [...current, ""]);
  };

  const saveWord = async () => {
    const filteredMeanings = meanings
      .map((meaning) => meaning.trim())
      .filter(Boolean);

    if (!word.trim() || filteredMeanings.length === 0) {
      return;
    }

    const client = createClient();
    const result = await createWord(client, {
      term: word.trim(),
      meanings: filteredMeanings,
      memo: memo.trim() || undefined,
      category: selectedCategory,
      reading: reading.trim() || undefined,
      supplement: supplement.trim() || undefined,
    });

    if (!result.ok) {
      console.error("Word save failed:", result.error);
      return;
    }

    setWord("");
    setMeanings([""]);
    setMemo("");
    setReading("");
    setSupplement("");
  };

  return (
    <div className="space-y-5 p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Category selector */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">教科</label>
        <div className="flex flex-wrap gap-2">
          {wordSubjects
            .filter((opt) => opt.key !== "all")
            .map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedCategory(option.key as WordCategory)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  selectedCategory === option.key
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
        </div>
      </div>

      {/* Term input */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">{currentLabels.term}</label>
        <input
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder={currentLabels.termPlaceholder}
          value={word}
          onChange={(event) => setWord(event.target.value)}
        />
      </div>

      {/* Meanings input */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">{currentLabels.meaning}</label>
        <div className="space-y-2">
          {meanings.map((meaning, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder={currentLabels.meaningPlaceholder}
                value={meaning}
                onChange={(event) => handleMeaningChange(index, event.target.value)}
              />
              {meanings.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMeanings((current) => current.filter((_, idx) => idx !== index))}
                  className="h-11 w-11 rounded-2xl bg-rose-100 text-rose-700 transition hover:bg-rose-200 font-bold"
                  aria-label="削除"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
            onClick={addMeaningField}
          >
            + {currentLabels.meaning}を追加
          </button>
        </div>
      </div>

      {/* Reading input */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">{currentLabels.reading}</label>
        <input
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder={currentLabels.readingPlaceholder}
          value={reading}
          onChange={(event) => setReading(event.target.value)}
        />
      </div>

      {/* Supplement input */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">{currentLabels.supplement}</label>
        <textarea
          className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder={currentLabels.supplementPlaceholder}
          value={supplement}
          onChange={(event) => setSupplement(event.target.value)}
          rows={2}
        />
      </div>

      {/* Additional memo field */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">メモ</label>
        <textarea
          className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder="自分用のメモ"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={2}
        />
      </div>

      {/* Save button */}
      <button
        type="button"
        className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
        onClick={saveWord}
      >
        {currentLabels.subjectName}を登録
      </button>
    </div>
  );
}
