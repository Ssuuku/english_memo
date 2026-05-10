"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import { createWord } from "@/features/words/lib/wordsRepo";

export default function NewWordForm() {
  const [word, setWord] = useState("");
  const [meanings, setMeanings] = useState([""]);
  const [memo, setMemo] = useState("");

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
      memo: memo.trim(),
    });

    if (!result.ok) {
      console.error("Word save failed:", result.error);
      return;
    }

    setWord("");
    setMeanings([""]);
    setMemo("");
  };

  return (
    <div className="space-y-4 p-4 rounded border border-slate-200 bg-white shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700">Word</label>
        <input
          className="mt-1 block w-full rounded border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={word}
          onChange={(event) => setWord(event.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Meanings</label>
        <div className="mt-1 space-y-2">
          {meanings.map((meaning, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="flex-1 rounded border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder={`Meaning ${index + 1}`}
                value={meaning}
                onChange={(event) => handleMeaningChange(index, event.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
          onClick={addMeaningField}
        >
          Add meaning
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Memo</label>
        <textarea
          className="mt-1 block w-full rounded border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={memo}
          rows={3}
          onChange={(event) => setMemo(event.target.value)}
        />
      </div>

      <div>
        <button
          type="button"
          className="inline-flex items-center rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          onClick={saveWord}
        >
          Save word
        </button>
      </div>
    </div>
  );
}
