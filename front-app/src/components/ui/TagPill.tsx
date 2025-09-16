"use client";

import type { TagId, TagLabel } from "@/types/tag";
import { CSSProperties } from "react";

type Props = {
  id: TagId;
  label: TagLabel;
  onClick: (id: TagId) => void;
  empathize?: boolean;
};

// --- Style Definitions ---

// Tailwindで定義できないカスタムカラースタイル
const baseStyle: CSSProperties = {
  backgroundColor: 'rgb(33, 34, 63)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
};

const emphasizedStyle: CSSProperties = {
  backgroundColor: 'rgba(255, 105, 180, 0.15)',
  borderColor: 'rgba(255, 105, 180, 0.7)',
  boxShadow: '0 0 8px rgba(255, 105, 180, 0.4)',
};

// --- Component ---

export default function TagPill({ id, label, onClick, empathize = false }: Props) {
  // Tailwindのクラスを定義
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full border text-sm text-white transition-all duration-200 cursor-pointer outline-none";

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      // Tailwindのクラスと、条件に応じたカスタムスタイルを両方適用
      className={baseClasses}
      style={empathize ? emphasizedStyle : baseStyle}
      aria-label={`タグ ${label}`}
    >
      {label} 
      {/* <span className="text-white/60 ml-1.5">[{id}]</span> */}
    </button>
  );
}
