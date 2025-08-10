import "server-only";
import { enumerateDownTo2506late } from "@/lib/fetch/periods";
import { BatchItem } from "@/types/batch";

export async function fetchAllTagCountsBatch(): Promise<BatchItem[]> {
  const UPSTREAM = process.env.UPSTREAM_API_BASE;
  if (!UPSTREAM) throw new Error("UPSTREAM_API_BASE not set");

  const periods = enumerateDownTo2506late();

  const results = await Promise.all(
    periods.map(async (p) => {
      const r = await fetch(`${UPSTREAM}/index/${p}/tag_counts`, {
        cache: "no-store",
      });
      if (!r.ok) return null; // 無い期間はスキップ
      const data = await r.json(); // ← 生JSON
      return { period: p, data } as BatchItem;
    })
  );

  return results.filter((x): x is BatchItem => !!x);
}
