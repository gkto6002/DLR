// app/[month]/[tag]/page.tsx
import {
  fetchAllTagCountsBatch,
  fetchRanking,
  extractTagsFromRawTagCounts,
} from "@/lib/dlsite/fetchers";

// export const revalidate = 21600; // ISR: 6h

export const dynamicParams = false;

type PageProps = { params: Promise<{ month: string; tag: string }> };

// SSG: 全期間の tag_counts から「その月(YYMM)ごとのタグ集合」を作って静的パスを生成
export async function generateStaticParams() {
  const batch = await fetchAllTagCountsBatch(); // [{ period: "2508early", data: [...] }, ...]
  const byMonth = new Map<string, Set<string>>();

  for (const { period, data } of batch) {
    const month = period.slice(0, 4); // "YYMM"
    const tags = extractTagsFromRawTagCounts(data);
    if (!byMonth.has(month)) byMonth.set(month, new Set());
    const set = byMonth.get(month)!;
    tags.forEach((t) => set.add(t));
  }

  const params: Array<{ month: string; tag: string }> = [];
  for (const [month, set] of byMonth) {
    for (const tag of set) params.push({ month, tag });
  }
  return params;
}

async function fetchRankingIfExists(period: string, tag: string) {
  try {
    const json = await fetchRanking(period, tag);
    return { period, json };
  } catch {
    return null; // 404/403 等は「そのスロットは無し」として無視
  }
}

export default async function Page({ params }: PageProps) {
  const { month, tag } = await params; // month = "YYMM" 例: "2506"

  // early/late の両方を試す（存在しなければ null）
  const [allTagCounts, early, late] = await Promise.all([
    fetchAllTagCountsBatch(), // 全期間の tag_counts（生JSON）を表示用に
    fetchRankingIfExists(`${month}early`, tag),
    fetchRankingIfExists(`${month}late`, tag),
  ]);

  const hasAny = !!(early || late);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          /{month}/{tag}
        </h1>
        <p className="text-sm text-gray-600">
          同月の early / late ランキング（生JSON）＋ 全期間の
          tag_counts（生JSON）
        </p>
      </header>

      {/* ランキング（同月の early/late を同ページに） */}
      <section className="rounded-2xl border p-4 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">
          Ranking JSON ({month} / {tag})
        </h2>

        {!hasAny && (
          <p className="text-sm text-gray-500">
            この月のランキングは見つかりませんでした（early/late
            いずれも無し）。
          </p>
        )}

        {early && (
          <div>
            <h3 className="mb-2 font-mono text-sm font-semibold">
              {early.period}
            </h3>
            <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(early.json, null, 2)}
            </pre>
          </div>
        )}

        {late && (
          <div>
            <h3 className="mb-2 font-mono text-sm font-semibold">
              {late.period}
            </h3>
            <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
              {JSON.stringify(late.json, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* 全期間の tag_counts（生JSONのまま、最新→過去） */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">
          All Periods tag_counts JSON (latest → past)
        </h2>
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
