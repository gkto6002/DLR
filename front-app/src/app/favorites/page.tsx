'use client';

import CardList from "@/components/templates/CardList"; // CardListコンポーネントをインポート
import type { RankingJson } from "@/types/ranking"; // 型定義をインポート
import { useState, useEffect } from "react";

const FAVORITES_KEY = "favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<RankingJson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // コンポーネントがマウントされた後にlocalStorageからデータを取得
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const parsedFavorites: RankingJson[] = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []); // 依存配列が空なので、一度だけ実行される

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-xl">お気に入りデータを読み込み中...</p>
      </main>
    );
  }

  // お気に入りがない場合のメッセージ
  if (favorites.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-center">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">お気に入り一覧</h1>
          <p className="mt-2 text-gray-500">
            保存したお気に入りの作品を表示します。
          </p>
        </header>
        <p className="text-xl text-gray-400">お気に入りの作品がありません。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">お気に入り一覧</h1>
        <p className="mt-2 text-gray-500">
          保存したお気に入りの作品を表示します。
        </p>
      </header>

      <CardList items={favorites} type={"favorite"} />
    </main>
  );
}