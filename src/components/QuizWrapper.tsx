"use client";

import { useState } from "react";
import type { Word } from "@/features/words/types";
import QuizForm, { type QuizResult } from "@/components/QuizForm";
import QuizResultComponent from "@/components/QuizResult";

type QuizWrapperProps = {
  words: Word[];
  allWords: Word[];
};

export default function QuizWrapper({ words, allWords }: QuizWrapperProps) {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>(words);

  const handleQuizFinish = (result: QuizResult) => {
    setQuizResult(result);
  };

  const handleRestart = () => {
    setQuizResult(null);
  };

  const handleRestartSameCount = async (count: number) => {
    try {
      const res = await fetch(`/api/random-words?limit=${count}`);
      const json = await res.json();
      if (json.ok) {
        setCurrentWords(json.data);
        setQuizResult(null);
      } else {
        console.error('ランダム取得に失敗しました', json.error);
      }
    } catch (e) {
      console.error('ランダム取得エラー', e);
    }
  };

  if (quizResult) {
    return <QuizResultComponent result={quizResult} onRestart={handleRestart} onRestartSameCount={handleRestartSameCount} />;
  }

  return (
    <QuizForm
      words={currentWords}
      allWords={allWords}
      onFinish={handleQuizFinish}
    />
  );
}