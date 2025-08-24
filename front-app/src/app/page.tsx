// app/page.tsx
import { redirect } from "next/navigation";
import { fetchAllTagCountsBatch, extractTagsFromRawTagCounts } from "@/lib/fetch/fetchers";
import { periodToMonth } from "@/lib/periods/normalize";

// （任意）キャッシュしたい場合はISR
// export const revalidate = 21600;

export default async function Home() {
  const batch = await fetchAllTagCountsBatch(); // [{ period: "YYMMearly", data }, ...]
  if (!batch || batch.length === 0) {
    // データが無ければトップはそのまま（簡易メッセージ）
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-lg font-semibold">データが見つかりませんでした</h1>
      </main>
    );
  }

  // 1) 全ての月（YYMM）を抽出して降順
  const monthSet = new Set<string>();
  for (const { period } of batch) {
    const m = periodToMonth(period);
    if (m) monthSet.add(m);
  }
  const monthsDesc = Array.from(monthSet).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  const latestMonth = monthsDesc[0];

  // 2) early にタグ "032" が含まれる最新の月を探す
  let monthWith032: string | null = null;
  // 直近から順にチェック
  for (const m of monthsDesc) {
    const early = batch.find((b) => b.period === `${m}early`);
    if (!early) continue;
    const tags = extractTagsFromRawTagCounts(early.data); // ["032","046",...]
    if (tags?.includes("032")) {
      monthWith032 = m;
      break;
    }
  }

  const targetMonth = monthWith032 ?? latestMonth;
  if (!targetMonth) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-lg font-semibold">利用可能な月がありません</h1>
      </main>
    );
  }

  redirect(`/${targetMonth}/032`);
}
