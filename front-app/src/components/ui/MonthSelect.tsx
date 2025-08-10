// src/components/ui/MonthSelect.tsx
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
      className="border rounded px-2 py-1 w-[220px] bg-white"
    >
      <option value="" disabled>月を選択</option>
      {months.map((m) => (
        <option key={m} value={m}>
          {monthKeyToLabel(m as any)}
        </option>
      ))}
    </select>
  );
}
