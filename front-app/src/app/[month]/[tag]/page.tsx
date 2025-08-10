// src/app/[month]/[tag]/page.tsx
import {
  fetchAllTagCountsBatch,
  fetchRanking,
} from "@/lib/fetch/fetchers";
import { buildTagMonthParamsFromBatch } from "@/lib/ssg/buildParams";
import MonthEarlyTagNavigatorFromBatch from "@/components/view/MonthEarlyTagNavigatorFromBatch";

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

  const hasAny = !!(early || late);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">/{month}/{tag}</h1>
        <p className="text-sm text-gray-600">
          同月の early / late ランキング（生JSON）＋ 全期間の tag_counts（生JSON）
        </p>
      </header>

      {/* ★ 追加：遷移UI（pageでfetch済みのbatchを渡す／整形はview側） */}
      <MonthEarlyTagNavigatorFromBatch batch={allTagCounts} initialMonth={month} />

      {/* ランキング表示（既存） */}
      <section className="rounded-2xl border p-4 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Ranking JSON ({month} / {tag})</h2>
        {!hasAny && (
          <p className="text-sm text-gray-500">
            この月のランキングは見つかりませんでした（early/late いずれも無し）。
          </p>
        )}
        {early && (
          <div>
            <h3 className="mb-2 font-mono text-sm font-semibold">{early.period}</h3>
            <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(early.json, null, 2)}
            </pre>
          </div>
        )}
        {late && (
          <div>
            <h3 className="mb-2 font-mono text-sm font-semibold">{late.period}</h3>
            <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(late.json, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* 全期間の tag_counts（既存） */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">All Periods tag_counts JSON (latest → past)</h2>
        <div className="space-y-6">
          {allTagCounts.map(({ period, data }) => (
            <div key={period}>
              <h3 className="mb-2 font-mono text-sm font-semibold">{period}</h3>
              <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
