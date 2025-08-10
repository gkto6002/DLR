"use client";

import type { TagId, TagLabel } from "@/types/tag";

type Props = {
  id: TagId;
  label: TagLabel;
  onClick: (id: TagId) => void;
};

export default function TagPill({ id, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="inline-flex items-center px-3 py-1 rounded-full border border-slate-600 bg-slate-700 text-sm text-gray-200 hover:bg-slate-600 hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`タグ ${label}`}
    >
      {label} <span className="text-gray-400 ml-1.5">[{id}]</span>
    </button>
  );
}
