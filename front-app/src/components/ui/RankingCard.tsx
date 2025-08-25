"use client";

import { labelOf } from "@/lib/tags/map";
import { RankingJson } from "@/types/ranking";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type RankingCardProps = {
  rank: number;
  item: RankingJson;
  tag?: string;
  type?: "ranking" | "favorite"
};

// localStorageのキー
const FAVORITES_KEY = "favorites";

export default function RankingCard({ rank, item, tag, type = "ranking" }: RankingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // コンポーネントがマウントされた時に、お気に入り状態をチェック
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    setIsFavorite(
      favorites.some((fav: RankingJson) => fav.RJ_number === item.RJ_number)
    );
  }, [item.RJ_number]);

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as RankingJson[];
    const isCurrentlyFavorite = favorites.some(
      (fav) => fav.RJ_number === item.RJ_number
    );

    if (isCurrentlyFavorite) {
      // 既にお気に入りなら削除
      favorites = favorites.filter(
        (fav) => fav.RJ_number !== item.RJ_number
      );
      setIsFavorite(false);
    } else {
      // お気に入りに登録
      favorites.push(item);
      setIsFavorite(true);
    }

    // Setを使って重複を排除
    const uniqueFavorites = Array.from(
      new Set(favorites.map((fav) => JSON.stringify(fav)))
    ).map((str: unknown) => {
      // 型ガードを使用して unknown を string に絞り込む
      if (typeof str === 'string') {
        return JSON.parse(str);
      }
      // または、アサーションを使用する (推奨はしない)
      // return JSON.parse(str as string);
    });

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueFavorites));
  };

  const asmrOneLink = `https://www.asmr.one/work/${item.RJ_number}`;
  const jpAsmrLink = `https://japaneseasmr.com/?s=${item.RJ_number}`.replace(
    "RJ",
    ""
  );

  // サムネイルURLを加工
  const thumbnailUrl = item.thumbnail_link
    .replace("/resize/", "/modpub/")
    .replace("_240x240.jpg", ".webp");

  return (
    <div className="bg-[#211821] text-white rounded-lg overflow-hidden shadow-lg border border-fuchsia-800/30 flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-blue-500/20">

      {/* ランキング番号とハートボタン */}
      <div className="px-3 py-2 flex justify-between items-center">
        {type === "ranking" ? <span className="text-xl font-bold text-pink-400">{!tag ? "" : labelOf(tag)} #{rank}</span> : <span className="text-xl font-bold text-red-400">No.{rank}</span>}
        <button onClick={toggleFavorite} className="text-xl text-pink-400 hover:text-pink-500 transition-colors duration-200">
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
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
          <h3 className="font-bold text-lg line-clamp-2" title={item.title}>
            {item.title}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            声優: {item.character_voice.join(", ")}
          </p>
          <p className="text-sm text-gray-400">サークル: {item.circle}</p>
          <p className="text-sm text-gray-400">RJ番号: {item.RJ_number}</p>
          <p className="text-sm text-gray-400">評価数: {item.reputation_sum}</p>

          {/* ✅ タグ: すべて表示 */}
          {item.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2" aria-label="作品タグ">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-white bg-[rgb(33,34,63)] border-white/20"
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
