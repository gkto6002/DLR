// src/components/view/EarlyTagsByMonth.tsx
import { periodToMonth, compareMonthDesc, MonthKey } from "@/lib/periods/normalize";
import { labelOf } from "@/lib/tags/map";
import { extractTagsFromRawTagCounts } from "@/lib/fetch/fetchers";
import MonthTagExtractor from "@/components/templates/MonthTagExtractor";
import type { TagItem } from "@/types/tag";
import type { BatchItem } from "@/types/batch";

type Props = {
  /** pageでfetchした batch をそのまま渡す */
  batch: BatchItem[];
  /** 既定の表示月（/ [month] / [tag] の month を渡すとUX良） */
  initialMonth?: string;
  tag: string;
};

export default function EarlyTagsByMonth({ batch, initialMonth, tag }: Props) {
  // earlyのみ対象にして 「月→タグID集合」 を構築
  const monthToTags = new Map<MonthKey, Set<string>>();

  for (const { period, data } of batch) {
    if (!period.endsWith("early")) continue;
    const month = periodToMonth(period);
    if (!month) continue;

    const tagIds = extractTagsFromRawTagCounts(data); // 例: ["032","046",...]
    if (!monthToTags.has(month)) monthToTags.set(month, new Set());
    const set = monthToTags.get(month)!;
    tagIds.forEach((id) => set.add(id));
  }

  // 降順に月を並べ、ID→ラベル解決
  const monthsDesc = Array.from(monthToTags.keys()).sort(compareMonthDesc);
  const monthToTagsResolved: Record<string, TagItem[]> = {};

  for (const m of monthsDesc) {
    const ids = Array.from(monthToTags.get(m)!).sort();
    monthToTagsResolved[m] = ids.map((id) => ({ id, label: labelOf(id) }));
  }

  return (
    <MonthTagExtractor
      monthsDesc={monthsDesc}
      monthToTags={monthToTagsResolved}
      initialMonth={initialMonth ?? monthsDesc[0]}
      tag={tag}
    />
  );
}
