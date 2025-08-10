// src/lib/periods/normalize.ts
export type MonthKey = `${number}${number}${number}${number}`; // "2508" 等

export function periodToMonth(period: string): MonthKey | null {
  const m = period.match(/^(\d{2})(0[1-9]|1[0-2])(early|mid|late)?$/);
  return m ? (`${m[1]}${m[2]}` as MonthKey) : null;
}

export function compareMonthDesc(a: MonthKey, b: MonthKey): number {
  return a < b ? 1 : a > b ? -1 : 0;
}

export function monthKeyToLabel(month: MonthKey): string {
  const yy = Number(month.slice(0, 2));
  const mm = Number(month.slice(2, 4));
  const year = 2000 + yy;
  return `${year}年${String(mm).padStart(2, "0")}月`;
}
