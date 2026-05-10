export type ScoreRank = {
  label: string;
  color: string;
};

export function getScoreRank(score: number): ScoreRank {
  if (score <= -3) return { label: "宿敵", color: "bg-rose-100 text-rose-700" };
  if (score <= -1) return { label: "要警戒", color: "bg-orange-100 text-orange-700" };
  if (score <= 1) return { label: "Bronze", color: "bg-amber-100 text-amber-700" };
  if (score <= 3) return { label: "Silver", color: "bg-slate-100 text-slate-700" };
  return { label: "Gold", color: "bg-sky-100 text-sky-700" };
}
