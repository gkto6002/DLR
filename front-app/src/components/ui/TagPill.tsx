// src/components/ui/TagPill.tsx
"use client";

type Props = {
  id: string;
  label: string;
  onClick: (id: string) => void;
};

export default function TagPill({ id, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="inline-flex items-center px-2 py-1 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm focus:outline-none"
      aria-label={`タグ ${label}`}
    >
      {label} <span className="opacity-60 ml-1">[{id}]</span>
    </button>
  );
}
