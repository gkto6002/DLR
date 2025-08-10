"use client";
import { monthKeyToLabel } from "@/lib/periods/normalize";
import type { MonthKey } from "@/lib/periods/normalize";

// Propsの型を汎用的なstringに変更
type Props = {
  value: string;
  months: string[]; // "YYMM" 降順
  onChange: (v: MonthKey) => void; // 親コンポーネントへの通知は厳密な型のまま
};

export default function MonthSelect({ value, months, onChange }: Props) {
  return (
    <select
      value={value}
      // selectのonChangeイベントから受け取る値はstringだが、MonthKeyとして扱うことを明示
      onChange={(e) => onChange(e.target.value as MonthKey)}
      className="border border-slate-600 rounded-md px-3 py-1.5 w-[220px] bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <option value="" disabled>月を選択</option>
      {months.map((m) => (
        <option key={m} value={m}>
          {/* string型のmをMonthKeyとして扱って関数に渡す */}
          {monthKeyToLabel(m as MonthKey)}
        </option>
      ))}
    </select>
  );
}
