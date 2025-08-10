// src/lib/ssg/buildTagMonthParams.ts
import { periodToMonth } from "@/lib/periods/normalize";
import { extractTagsFromRawTagCounts } from "@/lib/fetch/fetchers";
import type { BatchItem } from "@/types/batch"; 
export type TagMonthParam = { month: string; tag: string };

// batch（[{period:"YYMMearly",data},...]）→ [{month:"YYMM", tag:"nnn"}...]
export function buildTagMonthParamsFromBatch(batch: BatchItem[]): TagMonthParam[] {
  const byMonth = new Map<string, Set<string>>();

  for (const { period, data } of batch) {
    const month = periodToMonth(period); // ← バリデーション込み
    if (!month) continue;
    const tags = extractTagsFromRawTagCounts(data); // ["032","046",...]
    if (!byMonth.has(month)) byMonth.set(month, new Set());
    const set = byMonth.get(month)!;
    tags.forEach((t) => set.add(t));
  }

  const params: TagMonthParam[] = [];
  for (const [month, set] of byMonth) {
    for (const tag of set) params.push({ month, tag });
  }
  return params;
}
