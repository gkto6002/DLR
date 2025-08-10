"use client";
import { monthKeyToLabel } from "@/lib/periods/normalize";

type Props = {
  value: string;
  months: string[]; // "YYMM" 降順
  onChange: (v: string) => void;
};

export default function MonthSelect({ value, months, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-slate-600 rounded-md px-3 py-1.5 w-[220px] bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <option value="" disabled>月を選択</option>
      {months.map((m) => (
        // optionの背景色は一部ブラウザでは直接指定が難しいため、select側で制御します
        <option key={m} value={m}>
          {monthKeyToLabel(m as any)}
        </option>
      ))}
    </select>
  );
}
