export type Half = "early" | "late";

// JSTで今日を判定（1–15=early, 16–末=late）
function todayInJST() {
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return {
    yy: Number(parts.year),
    mm: Number(parts.month),
    dd: Number(parts.day),
  };
}

export function currentSlotJST(): { yy: number; mm: number; half: Half } {
  const { yy, mm, dd } = todayInJST();
  return { yy, mm, half: dd >= 16 ? "late" : "early" };
}

export function prevSlot(s: { yy: number; mm: number; half: Half }): { yy: number; mm: number; half: Half } {
  if (s.half === "late") return { ...s, half: "early" };
  const pm = s.mm - 1;
  if (pm >= 1) return { yy: s.yy, mm: pm, half: "late" };
  return { yy: (s.yy + 99) % 100, mm: 12, half: "late" };
}

export function toPeriod(s: { yy: number; mm: number; half: Half }) {
  return `${String(s.yy).padStart(2, "0")}${String(s.mm).padStart(2, "0")}${s.half}`;
}

export function enumerateDownTo2506late(): string[] {
  const floor = "2507early";
  const out: string[] = [];
  let cur = currentSlotJST();
  for (let i = 0; i < 200; i++) {
    const p = toPeriod(cur);
    out.push(p);
    if (p === floor) break;
    cur = prevSlot(cur);
  }
  return out;
}
