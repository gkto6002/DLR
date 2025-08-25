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
      onChange={(e) => onChange(e.target.value as MonthKey)}
      className="w-[220px] rounded-md border px-3 py-1.5 text-white transition-colors focus:outline-none bg-[rgb(33,34,63)] border-white/20 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50"
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
