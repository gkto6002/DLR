"use client";
import { RankingJson } from "@/types/ranking";
import RankingTabs from "../templates/RankingTabs";


// データの方を定義します。anyのままでも動作しますが、型を付けるとより安全になります。
type RankingData = {
  period: string;
  json: RankingJson[];
} | null;

type RankingViewProps = {
  early: RankingData;
  late: RankingData;
  tag: string;
  month: string;
};

// 型ガード: オブジェクトがRankingJson[]であるかを確認
function isRankingJsonArray(data: unknown): data is RankingJson[] {
    return Array.isArray(data) && data.length > 0 && 'RJ_number' in data[0];
}

export default function RankingView({
  early,
  late,
  tag,
  month
}: RankingViewProps) {
  // const hasAny = !!(early || late);

   // JSONデータを安全にパースして型付け
  const earlyItems: RankingJson[] = early && isRankingJsonArray(early.json) ? early.json : [];
  const lateItems: RankingJson[] = late && isRankingJsonArray(late.json) ? late.json : [];

  return (
    <main className="mx-auto max-w-6xl py-8 space-y-10">
      {/* 表示ロジックをRankingTabsコンポーネントに委任 */}
      <RankingTabs earlyItems={earlyItems} lateItems={lateItems} tag={tag} month={month}/>
    </main>
  );
}
