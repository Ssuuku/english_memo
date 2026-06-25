import type { WordCategory } from "@/features/words/types";

export type WordSubject = WordCategory | "all";

export const wordSubjects: { key: WordSubject; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "english", label: "English" },
  { key: "kobun", label: "古文" },
  { key: "kanbun", label: "漢文" },
];

export function parseWordSubject(param: string | string[] | undefined): WordSubject {
  const value = Array.isArray(param) ? param[0] : param;
  if (value === "english" || value === "kobun" || value === "kanbun") {
    return value;
  }
  if (value === "all") {
    return "all";
  }
  return "english";
}

export function getWordSubjectLabel(subject: WordSubject) {
  switch (subject) {
    case "kobun":
      return "古文";
    case "kanbun":
      return "漢文";
    case "english":
      return "English";
    case "all":
    default:
      return "すべて";
  }
}

export function getWordSubjectName(subject: WordCategory) {
  switch (subject) {
    case "kobun":
      return "古文";
    case "kanbun":
      return "漢文";
    case "english":
    default:
      return "英単語";
  }
}

export type WordFormLabels = {
  term: string;
  termPlaceholder: string;
  meaning: string;
  meaningPlaceholder: string;
  reading: string;
  readingPlaceholder: string;
  supplement: string;
  supplementPlaceholder: string;
  subjectName: string;
};

export function getWordFormLabels(subject: WordCategory): WordFormLabels {
  const subjectName = getWordSubjectName(subject);

  return {
    term: subjectName,
    termPlaceholder: subjectName,
    meaning: subject === "english" ? "Meaning(s)" : "意味",
    meaningPlaceholder: subject === "english" ? "Meaning 1" : "意味 1",
    reading: subject === "english" ? "Reading" : "読み",
    readingPlaceholder: subject === "english" ? "Pronunciation" : "読み",
    supplement: subject === "english" ? "Supplement" : "補足",
    supplementPlaceholder: subject === "english" ? "Context or notes" : "補足情報",
    subjectName,
  };
}

export function getQuestionPrompt(subject: WordCategory) {
  if (subject === "english") {
    return "この英単語の意味はどれ？";
  }
  return `この${getWordSubjectName(subject)}の意味はどれ？`;
}
