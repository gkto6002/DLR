// src/components/templates/TagNav.tsx
"use client";

import { useMemo, useState } from "react";
import MonthSelect from "@/components/ui/MonthSelect";
import TagPill from "@/components/ui/TagPill";
import { useTagPeriodNav } from "@/lib/routing/useTagNav";
import { TagItem } from "@/types/tag";

type Props = {
  monthsDesc: string[];
  monthToTags: Record<string, TagItem[]>;
  initialMonth?: string;
  tag: string;
};

export default function MonthEarlyTagNavigator({
  monthsDesc,
  monthToTags,
  initialMonth,
  tag
}: Props) {
  const defaultMonth = useMemo(
    () => initialMonth ?? monthsDesc[0] ?? "",
    [initialMonth, monthsDesc]
  );
  const [month, setMonth] = useState<string>(defaultMonth);
  const tags: TagItem[] = month ? (monthToTags[month] ?? []) : [];
  const { go } = useTagPeriodNav();

  return (
    <section className="bg-[#211821]/60 border border-fuchsia-800/30 rounded-xl p-4 md:p-6 space-y-4">

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 flex-shrink-0">月を選択</span>
        <MonthSelect value={month} months={monthsDesc} onChange={setMonth} />
      </div>

      <div className="border-t border-fuchsia-800/30 my-4"></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-gray-500 col-span-full">
            この月（early）にタグは見つかりませんでした。
          </p>
        )}
        {tags.map((t) => {
          // 強調表示するかどうかの条件を先に変数に入れておく
          const isEmpathized = (t.id === tag && initialMonth === month);

          return (
            <TagPill
              key={t.id}
              id={t.id}
              label={t.label}
              onClick={(id) => go(month, id)}
              empathize={isEmpathized} // 条件の結果をpropとして渡す
            />
          );
        })}
      </div>
    </section>
  );
}
