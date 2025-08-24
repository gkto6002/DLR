import { RankingJson } from "@/types/ranking";
import Image from "next/image";
import Link from "next/link";

type RankingCardProps = {
  rank: number;
  item: RankingJson;
};

export default function RankingCard({ rank, item }: RankingCardProps) {
  const asmrOneLink = `https://www.asmr.one/work/${item.RJ_number}`;
  const jpAsmrLink = `https://japaneseasmr.com/?s=${item.RJ_number}`.replace("RJ", "");

  // サムネイルURLを加工
  const thumbnailUrl = item.thumbnail_link
    .replace("/resize/", "/modpub/")
    .replace("_240x240.jpg", ".webp");

  return (
    <div className="bg-slate-800 text-white rounded-lg overflow-hidden shadow-lg border border-slate-700 flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-blue-500/20">
      {/* ランキング番号 */}
      <div className="px-3">
        <span className="text-xl font-bold text-blue-400">#{rank}</span>
      </div>

      {/* サムネイル */}
      <div className="relative w-full aspect-[4/3]"> 
        <Image
          src={thumbnailUrl}
          alt={item.title}
          fill
          className="object-contain"
          unoptimized
        />
      </div>


      {/* テキスト部分 */}
      <div className="p-2 space-y-1 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3
            className="font-bold text-lg line-clamp-2"
            title={item.title}
          >
            {item.title}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            声優: {item.character_voice.join(", ")}
          </p>
          <p className="text-sm text-gray-400">サークル: {item.circle}</p>
          <p className="text-sm text-gray-400">RJ番号: {item.RJ_number}</p>

          {/* ✅ タグ: すべて表示 */}
          {item.tags?.length > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-2"
              aria-label="作品タグ"
            >
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-slate-600 bg-slate-700/60 px-2 py-0.5 text-xs text-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* リンク：中央配置 */}
        <div className="flex justify-center gap-6 pt-2 mt-auto">
          <Link
            href={item.DL_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            DLsite
          </Link>
          <Link
            href={asmrOneLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:underline"
          >
            ASMR ONE
          </Link>
          <Link
            href={jpAsmrLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            JP ASMR
          </Link>
        </div>
      </div>
    </div>
  );
}
