// src/types/batch.ts
import type { TagCounts } from "@/types/tag";

/** fetchAllTagCountsBatch() の1件 */
export interface BatchItem {
  period: string;   // 例: "2508early"
  data: TagCounts;  // tag_counts の配列
}
