// src/lib/tags/map.ts
import type { TagId, TagLabel, TagMap } from "@/types/tag";
export const TAG_NAME_BY_ID: Record<string, string> = {
  "528": "本番なし",
  "156": "男性受け",
  "115": "逆レ",
  "523": "乳首責め",
  "144": "言葉責め",
  "032": "純愛",
  "046": "ハーレム",
  "116": "複数プレイ",
  "504": "おねショタ",
  "317": "人外娘/モンスター娘",
  "526": "快楽落ち",
  "536": "女性優位",
  "162": "触手",
  "136": "SM",
  "433": "逆転なし",
  "149": "羞恥/恥辱",
  "146": "拘束",
  "514": "オナサポ",
  "525": "ざぁ〜こ",
  "524": "おほごえ",
  "316": "ヤンデレ",
  "157": "トランス/暗示",
  "314": "トランス/暗示ボイス",
  "447": "風俗/ソープ",
};

export function labelOf(tagId: TagId): TagLabel {
  return TAG_NAME_BY_ID[tagId] ?? `タグ${tagId}`;
}
