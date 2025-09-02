// src/app/[month]/[tag]/page.tsx
// app/[month]/[tag]/page.tsx
import RankingView from "@/components/view/RankingView";
import {
  fetchAllTagCountsBatch,
  fetchRanking,
} from "@/lib/fetch/fetchers";
import { buildTagMonthParamsFromBatch } from "@/lib/ssg/buildParams";
import MonthEarlyTagNavigatorFromBatch from "@/components/view/EarlyTagsByMonth";
import RankingTitle from "@/components/ui/RaningTitle";

// 環境で切替: 開発やCIがUPSTREAMに届かない時もビルド通す
const SKIP_SSG = process.env.NEXT_SKIP_SSG === "1";

// 失敗時に動的解決できるように
export const dynamicParams = false; // ← まずはtrue運用で安定化
// ISRしたいなら↓を復活（任意）
// export const revalidate = 21600;

type PageProps = { params: Promise<{ month: string; tag: string }> };

// SSG: ここは共通ヘルパー + try/catch
export async function generateStaticParams() {
  if (SKIP_SSG) return [];
  try {
    const batch = await fetchAllTagCountsBatch();
    return buildTagMonthParamsFromBatch(batch);
  } catch (e) {
    console.warn("[generateStaticParams] upstream fetch failed. Skip prebuild.", e);
    return [];
  }
}

async function fetchRankingIfExists(period: string, tag: string) {
  try {
    const json = await fetchRanking(period, tag);
    return { period, json };
  } catch {
    return null;
  }
}

export default async function Page({ params }: PageProps) {
  const { month, tag } = await params;

  const [allTagCounts, early, late] = await Promise.all([
    fetchAllTagCountsBatch(),
    fetchRankingIfExists(`${month}early`, tag),
    fetchRankingIfExists(`${month}late`, tag),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">

      {/* ★ 追加：遷移UI（pageでfetch済みのbatchを渡す／整形はview側） */}
      <MonthEarlyTagNavigatorFromBatch batch={allTagCounts} initialMonth={month} tag={tag} />
      <RankingTitle month={month} tag={tag} />
      <RankingView early={early} late={late} tag={tag} month={month}/>
    </main>
  );
}
