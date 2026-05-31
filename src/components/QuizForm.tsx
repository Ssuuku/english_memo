"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/features/words/types";
import { buildMultipleChoiceQuestions } from "@/features/words/lib/quizLogic";
import { getScoreRank } from "@/features/words/lib/scoreRank";
import { updateWordStats } from "@/features/words/lib/wordsRepo";
import { createClient } from "@/lib/supabase/browserClient";

export type RankChange = {
  term: string;
  before: string;
  after: string;
  delta: number;
};

export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  wrongWords: { term: string; correctMeaning: string; userAnswer: string }[];
  rankChanges: RankChange[];
};

export type QuizFormProps = {
  words: Word[];
  allWords?: Word[];
  onFinish?: (result: QuizResult) => void;
};

export default function QuizForm({ words, allWords, onFinish }: QuizFormProps) {
  const questions = useMemo(() => buildMultipleChoiceQuestions(words, allWords || words), [words, allWords]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<{ term: string; correctMeaning: string; userAnswer: string }[]>([]);
  const [rankChanges, setRankChanges] = useState<RankChange[]>([]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4">
        <p className="text-sm font-semibold">四択問題を作成できませんでした。</p>
        <p className="mt-1 text-xs text-zinc-600">単語の意味を複数行で登録するか、意味数を増やしてください。</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = selectedIndex !== null;

  async function handleChoice(choiceIndex: number) {
    if (isAnswered) return;
    setSelectedIndex(choiceIndex);
    setAnswered((prev) => prev + 1);
    const unknownChoiceIndex = currentQuestion.choices.length; // index reserved for "わからない"
    const isCorrect = choiceIndex === currentQuestion.correctIndex;
    const userAnswer = choiceIndex === unknownChoiceIndex ? "わからない" : currentQuestion.choices[choiceIndex];
    const beforeRank = getScoreRank(currentQuestion.score).label;

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      setCorrectCount((prevCount) => prevCount + 1);
    } else {
      setScore((prevScore) => prevScore - 1);
      setWrongWords((prev) => [
        ...prev,
        {
          term: currentQuestion.term,
          correctMeaning: currentQuestion.correctMeaning,
          userAnswer,
        },
      ]);
    }

    const client = createClient();
    const result = await updateWordStats(client, currentQuestion.wordId, {
      scoreDelta: isCorrect ? 1 : -1,
      correctDelta: isCorrect ? 1 : undefined,
      wrongDelta: isCorrect ? undefined : 1,
    });

    if (result.ok) {
      const afterRank = getScoreRank(result.data.score).label;
      if (afterRank !== beforeRank) {
        setRankChanges((prev) => [
          ...prev,
          {
            term: currentQuestion.term,
            before: beforeRank,
            after: afterRank,
            delta: result.data.score - currentQuestion.score,
          },
        ]);
      }
    }

    if (!result.ok) {
      console.error("スコア更新に失敗しました", result.error);
    }
  }

  function handleNext() {
    if (currentIndex === totalQuestions - 1) {
      if (onFinish) {
        onFinish({
          totalQuestions,
          correctAnswers: correctCount,
          score,
          wrongWords,
          rankChanges,
        });
      }
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
    }
  }

  const isFinished = currentIndex === totalQuestions - 1 && isAnswered;

  return (
    <section className="mt-5 rounded-3xl bg-white/90 p-4 ring-1 ring-zinc-100 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-600">
          問題 {currentIndex + 1} / {totalQuestions}
        </p>
        <p className="text-xs font-semibold text-sky-700">
          正解: {correctCount} / {answered}
        </p>
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
        <div
          className="h-full bg-sky-500 transition-all"
          style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs font-semibold text-zinc-500">この英単語の意味はどれ？</p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">{currentQuestion.term}</p>
        {currentQuestion.memo && (
          <p className="mt-3 text-xs text-zinc-600 bg-zinc-50 rounded-lg px-3 py-2">
            {currentQuestion.memo}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-3">
        {currentQuestion.choices.map((choice, index) => {
          const isCorrect = selectedIndex !== null && index === currentQuestion.correctIndex;
          const isSelected = selectedIndex === index;
          const buttonClass = isAnswered
            ? isCorrect
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : isSelected
              ? "bg-rose-50 border-rose-300 text-rose-900"
              : "bg-zinc-50 border-zinc-200 text-zinc-900"
            : "bg-white border border-zinc-200 text-zinc-950 hover:bg-sky-50";

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleChoice(index)}
              disabled={isAnswered}
              className={`rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${buttonClass}`}
            >
              {choice}
            </button>
          );
        })}
        {/* わからないボタン（不正解扱い） */}
        {(() => {
          const index = currentQuestion.choices.length;
          const isCorrect = selectedIndex !== null && index === currentQuestion.correctIndex;
          const isSelected = selectedIndex === index;
          const buttonClass = isAnswered
            ? isCorrect
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : isSelected
              ? "bg-rose-50 border-rose-300 text-rose-900"
              : "bg-zinc-50 border-zinc-200 text-zinc-900"
            : "bg-white border border-zinc-200 text-zinc-950 hover:bg-sky-50";

          return (
            <button
              key="unknown"
              type="button"
              onClick={() => handleChoice(index)}
              disabled={isAnswered}
              className={`rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${buttonClass}`}
            >
              わからない
            </button>
          );
        })()}
      </div>

      {isAnswered ? (
        <div className="mt-6 space-y-4">
          <div
            className={`rounded-2xl px-4 py-3 ring-1 ${
              selectedIndex === currentQuestion.correctIndex
                ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                : "bg-rose-50 text-rose-800 ring-rose-100"
            }`}
          >
            <p className="text-sm font-extrabold">
              {selectedIndex === currentQuestion.correctIndex ? "正解です！🎉" : "不正解です。"}
            </p>
            {selectedIndex !== currentQuestion.correctIndex ? (
              <p className="mt-2 text-xs">正解は「{currentQuestion.correctMeaning}」でした。</p>
            ) : null}
          </div>

          <button
            onClick={handleNext}
            className="w-full h-12 rounded-2xl bg-zinc-950 text-sm font-extrabold text-white shadow-sm transition hover:bg-zinc-900"
          >
            {isFinished ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
