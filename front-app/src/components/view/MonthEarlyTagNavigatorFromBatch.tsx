// src/app/view/MonthEarlyTagNavigatorFromBatch.tsx
import {
  periodToMonth,
  compareMonthDesc,
  MonthKey,
} from "@/lib/periods/normalize";
import { labelOf } from "@/lib/tags/map";
import { extractTagsFromRawTagCounts } from "@/lib/fetch/fetchers";
import MonthEarlyTagNavigator from "@/components/templates/MonthTagExtractor";

type BatchItem = { period: string; data: unknown };

type Props = {
  batch: BatchItem[]; // pageでfetchしたものをそのまま受け取る
  initialMonth?: string; // pageのparams.monthを渡すと良い
};

export default function MonthEarlyTagNavigatorFromBatch({
  batch,
  initialMonth,
}: Props) {
  // earlyのみ対象にして 「月→タグID集合」 を作る
  const monthToTags = new Map<MonthKey, Set<string>>();
  for (const { period, data } of batch) {
    if (!period.endsWith("early")) continue;
    const month = periodToMonth(period);
    if (!month) continue;
    const tagIds = extractTagsFromRawTagCounts(data); // ["032","046",...]
    if (!monthToTags.has(month)) monthToTags.set(month, new Set());
    const set = monthToTags.get(month)!;
    tagIds.forEach((id) => set.add(id));
  }

  // 降順に月を並べ、ID→ラベル解決
  const monthsDesc = Array.from(monthToTags.keys()).sort(compareMonthDesc);
  const monthToTagsResolved: Record<string, { id: string; label: string }[]> =
    {};
  for (const m of monthsDesc) {
    const ids = Array.from(monthToTags.get(m)!).sort();
    monthToTagsResolved[m] = ids.map((id) => ({ id, label: labelOf(id) }));
  }

  return (
    <MonthEarlyTagNavigator
      monthsDesc={monthsDesc}
      monthToTags={monthToTagsResolved}
      initialMonth={initialMonth ?? monthsDesc[0]}
    />
  );
}
