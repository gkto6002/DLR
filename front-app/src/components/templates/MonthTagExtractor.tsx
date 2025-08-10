// src/components/templates/TagNav.tsx
"use client";

import { useMemo, useState } from "react";
import MonthSelect from "@/components/ui/MonthSelect";
import TagPill from "@/components/ui/TagPill";
import { useTagPeriodNav } from "@/lib/routing/useTagNav";

type TagItem = { id: string; label: string };

type Props = {
  monthsDesc: string[];                 // "YYMM" 降順
  monthToTags: Record<string, TagItem[]>; // month -> earlyのtag一覧
  initialMonth?: string;
};

export default function MonthEarlyTagNavigator({
  monthsDesc,
  monthToTags,
  initialMonth,
}: Props) {
  const defaultMonth = useMemo(
    () => initialMonth ?? monthsDesc[0] ?? "",
    [initialMonth, monthsDesc]
  );
  const [month, setMonth] = useState<string>(defaultMonth);
  const tags: TagItem[] = month ? (monthToTags[month] ?? []) : [];
  const { go } = useTagPeriodNav();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">月を選択</span>
        <MonthSelect value={month} months={monthsDesc} onChange={setMonth} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-gray-500 col-span-full">
            この月（early）にタグは見つかりませんでした。
          </p>
        )}
        {tags.map((t) => (
          <TagPill key={t.id} id={t.id} label={t.label} onClick={(id) => go(month, id)} />
        ))}
      </div>
    </section>
  );
}
