import { RankingJson } from "@/types/ranking";
import Image from "next/image";
import Link from "next/link";

type RankingCardProps = {
  rank: number;
  item: RankingJson;
};

export default function RankingCard({ rank, item }: RankingCardProps) {
  const asmrOneLink = `https://www.asmr.one/work/${item.RJ_number}`;

  // サムネイルURLを加工
  const thumbnailUrl = item.thumbnail_link
    .replace("/resize/", "/modpub/")
    .replace("_240x240.jpg", ".webp");

  return (
    // 背景色をslateに変更し、ホバーエフェクトを追加
    <div className="bg-slate-800 text-white rounded-lg overflow-hidden shadow-lg border border-slate-700 flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-blue-500/20">
      <div className="p-4">
        <span className="text-2xl font-bold">{rank}</span>
      </div>
      {/* 画像コンテナの背景色を削除し、高さを固定 */}
      <div className="relative w-full h-64">
        <Image
          src={thumbnailUrl} // 加工後のURLを使用
          alt={item.title}
          fill
          style={{ objectFit: 'contain' }} // 画像全体を表示
          unoptimized
        />
      </div>
      {/* テキストコンテンツのレイアウトを調整 */}
      <div className="p-4 space-y-2 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-bold text-lg truncate" title={item.title}>
            {item.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">声優: {item.character_voice.join(", ")}</p>
          <p className="text-sm text-gray-400">サークル: {item.circle}</p>
          <p className="text-sm text-gray-400">RJ番号: {item.RJ_number}</p>
        </div>
        <div className="flex space-x-4 pt-2 mt-auto">
          <Link href={item.DL_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            DLsite
          </Link>
          <Link href={asmrOneLink} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">
            ASMR ONLINE
          </Link>
        </div>
      </div>
    </div>
  );
}
