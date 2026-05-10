export type Word = {
  id: string;
  term: string;
  meaning: string | null;
  memo: string | null;
  score: number;
  correct_count: number;
  wrong_count: number;
  created_at?: string;
};

export type NewWordInput = {
  term: string;
  meaning?: string;
  meanings?: string[];
  memo?: string;
};

