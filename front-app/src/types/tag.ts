// src/types/tag.ts
/** "032" のようなゼロ埋め文字列IDを想定 */
export type TagId = string;

export type TagLabel = string;

/** UIで使う基本ペア */
export interface TagItem {
  id: TagId;
  label: TagLabel;
}

/** ID→ラベルの辞書（map.ts で使う） */
export type TagMap = Record<TagId, TagLabel>;

/** 月→タグ一覧（MonthTagNav系のpropsで使う） */
export type TagItemsByMonth = Record<string, TagItem[]>;

export type TagCounts = {
  tag_id: string[]
}[];