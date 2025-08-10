import { labelOf } from "@/lib/tags/map";

type Props = {
  month: string; // "YYMM"形式
  tag: string;
};

export default function RankingTitle({ month, tag }: Props) {
  // "YYMM"形式の文字列から年と月を抽出
  const year = `20${month.slice(0, 2)}`;
  const monthNum = parseInt(month.slice(2, 4), 10);

  const tagLabel = labelOf(tag); // タグラベルの解決（必要に応じて）

  return (
    <header className="text-center my-8 md:my-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
        {year}年 {monthNum}月
      </h1>
      <p className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mt-2">
        {tagLabel} ランキング
      </p>
    </header>
  );
}
