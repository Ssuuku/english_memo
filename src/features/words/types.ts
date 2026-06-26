export type WordCategory = "english" | "kobun" | "kanbun";

export type Word = {
  id: string;
  term: string;
  meaning: string | null;
  memo: string | null;
  score: number;
  correct_count: number;
  wrong_count: number;
  category: WordCategory;
  reading: string | null;
  supplement: string | null;
  kanbun_annotations?: { char: string; reading?: string | null; kaeriten?: string | null }[] | null;
  created_at?: string;
};

export type NewWordInput = {
  term: string;
  meaning?: string;
  meanings?: string[];
  memo?: string;
  category?: WordCategory;
  reading?: string;
  supplement?: string;
  kanbun_annotations?: { char: string; reading?: string | null; kaeriten?: string | null }[] | null;
};

