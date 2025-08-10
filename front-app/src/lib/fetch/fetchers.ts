// lib/dlsite/fetchers.ts
import "server-only";
import { enumerateDownTo2506late } from "@/lib/fetch/periods";
import { BatchItem } from "@/types/batch";
import { RankingJson } from "@/types/ranking";
import { TagCounts } from "@/types/tag";
const UPSTREAM = process.env.UPSTREAM_API_BASE;

/** 全期間の tag_counts を取得（最新→過去） */
export async function fetchAllTagCountsBatch(): Promise<BatchItem[]> {
  if (!UPSTREAM) throw new Error("UPSTREAM_API_BASE not set");

  const periods = enumerateDownTo2506late();
  const results = await Promise.all(
    periods.map(async (p) => {
      const r = await fetch(`${UPSTREAM}/index/${p}/tag_counts`, {
        cache: "force-cache",
      });
      if (!r.ok) return null;
      const data = await r.json(); // ← 生JSON
      return { period: p, data } as BatchItem;
    })
  );
  return results.filter((x): x is BatchItem => !!x);
}

/** 指定 period × tag のランキングを取得（生JSON） */
export async function fetchRanking(period: string, tag: string): Promise<RankingJson[]> {
  console.log(period, tag)
  if (!UPSTREAM) throw new Error("UPSTREAM_API_BASE not set");
  const r = await fetch(`${UPSTREAM}/${period}/${tag}.json`, {
    cache: "force-cache",
  });
  if (!r.ok) throw new Error(`Ranking fetch failed: ${r.status}`);
  return r.json(); // ← 生JSON
}

/** tag_counts の生JSONから tag 候補を取り出す（"032" 等） */
export function extractTagsFromRawTagCounts(raw: TagCounts): string[] {
  if (!Array.isArray(raw)) return [];
  const tags = new Set<string>();
  for (const row of raw) {
    const id = row?.tag_id;
    if (Array.isArray(id) && typeof id[0] === "string" && id[0]) {
      tags.add(id[0]);
    }
  }
  return Array.from(tags);
}
