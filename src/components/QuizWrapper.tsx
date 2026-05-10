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

  const handleQuizFinish = (result: QuizResult) => {
    setQuizResult(result);
  };

  const handleRestart = () => {
    setQuizResult(null);
  };

  if (quizResult) {
    return <QuizResultComponent result={quizResult} onRestart={handleRestart} />;
  }

  return (
    <QuizForm
      words={words}
      allWords={allWords}
      onFinish={handleQuizFinish}
    />
  );
}