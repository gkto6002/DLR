// src/lib/routing/useTagPeriodNav.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useTagPeriodNav() {
  const router = useRouter();
  const go = useCallback((monthYYMM: string, tagId: string) => {
    router.push(`/${monthYYMM}/${encodeURIComponent(tagId)}`);
  }, [router]);
  return { go };
}
