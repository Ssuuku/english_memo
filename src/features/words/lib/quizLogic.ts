import type { Word } from "@/features/words/types";

export type MultipleChoiceQuestion = {
  wordId: string;
  term: string;
  choices: string[];
  correctIndex: number;
  correctMeaning: string;
  memo: string | null;
  score: number;
};

function parseMeanings(raw: string | null | undefined): string[] {
  if (!raw) return [];

  return Array.from(
    new Set(
      raw
        .split(/\r?\n|;/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function buildMultipleChoiceQuestions(words: Word[], allWords?: Word[]): MultipleChoiceQuestion[] {
  const sourceWords = allWords || words;
  const allMeanings = sourceWords.flatMap((word) =>
    parseMeanings(word.meaning).map((meaning) => ({
      term: word.term,
      meaning,
    }))
  );

  const questions = words
    .map((word) => {
      const meanings = parseMeanings(word.meaning);
      if (meanings.length === 0) return null;

      const correctMeaning = meanings[Math.floor(Math.random() * meanings.length)];
      const otherCandidates = Array.from(
        new Set(
          allMeanings
            .filter((item) => item.term !== word.term && item.meaning !== correctMeaning)
            .map((item) => item.meaning)
        )
      );

      // 誤答候補が3つ未満の場合、allMeanings から重複を許して補う
      const distractors = shuffle(otherCandidates).slice(0, 3);
      if (distractors.length < 3) {
        const additionalCandidates = allMeanings
          .filter((item) => item.meaning !== correctMeaning)
          .map((item) => item.meaning);
        while (distractors.length < 3) {
          const randomIndex = Math.floor(Math.random() * additionalCandidates.length);
          distractors.push(additionalCandidates[randomIndex]);
        }
      }

      const choices = shuffle([correctMeaning, ...distractors]);

      if (choices.length < 4) return null;

      return {
        wordId: word.id,
        term: word.term,
        choices,
        correctIndex: choices.findIndex((choice) => choice === correctMeaning),
        correctMeaning,
        memo: word.memo,
        score: word.score ?? 0,
      };
    })
    .filter((question): question is MultipleChoiceQuestion => question !== null);

  return questions;
}
