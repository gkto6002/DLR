"use client";

import { useState, ReactNode, useEffect, useRef } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  month: string;
};

export default function Tabs({ tabs, month }: TabsProps) {
  const today = new Date();
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevYYMM = `${prevMonthDate.getFullYear().toString().slice(2)}${String(
    prevMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const initialTab = month === prevYYMM ? 1 : 0;

  const [activeTabIndex, setActiveTabIndex] = useState(initialTab);

  const topTabsRef = useRef<HTMLDivElement | null>(null);
  // ▼ ここから追加 ▼

  // 下付きタブの表示状態を管理するstate
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    // BackToTopButton.tsx と同じスクロール位置で表示を切り替える関数
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    // スクロールとリサイズのイベントリスナーを追加
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // 初期表示時にも判定を実行
    handleScroll();

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []); // 空の依存配列で、初回レンダリング時にのみ実行

  // ▲ ここまで追加 ▲
  // ▼ 追加: タブ切り替えヘルパー
  const activateTab = (index: number, scrollToTopTabs = false) => {
    setActiveTabIndex(index);
    if (scrollToTopTabs && topTabsRef.current) {
      // 固定ヘッダーがある前提で、Tailwindの scroll-mt-* と組み合わせる
      topTabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div>
      {/* 1. 通常表示されるタブ */}
      <div
        ref={topTabsRef}
        className="flex justify-center border-b border-gray-700 mb-4 scroll-mt-20"
        // ↑ scroll-mt-20: 固定ヘッダー分の余白（約80px）。ヘッダー高さに合わせて 16〜28 など調整可
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`py-2 px-6 font-semibold transition-colors duration-300 ${
              activeTabIndex === index
                ? "text-white border-b-2 border-pink-500"
                : "text-gray-600 hover:text-white"
            }`}
            onClick={() => activateTab(index, false)} // ← 上側はスクロールしない
            aria-selected={activeTabIndex === index}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブに対応するコンテンツ */}
      <div>{tabs[activeTabIndex].content}</div>

      {/* 2. スクロール時に画面下部に表示される固定タブ */}
      {/* 固定ボトムバー（iPhone風） */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
          isFixed ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          backgroundColor: "rgba(14, 8, 16, 0.88)", // かなり暗い紫寄り
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <nav
          className="flex items-center justify-around px-2 pt-2
               pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
          role="tablist"
          aria-label="Bottom Tabs"
        >
          {tabs.map((tab, index) => {
            const active = activeTabIndex === index;
            return (
              <button
                key={tab.label}
                onClick={() => activateTab(index, true)}
                aria-selected={active}
                role="tab"
                className={[
                  "group flex-1 min-w-0 py-2 flex flex-col items-center justify-center",
                  "text-sm font-medium select-none transition-colors",
                  active
                    ? "text-white" // ← アクティブ時は白
                    : "text-zinc-400 hover:text-zinc-100",
                ].join(" ")}
              >
                {/* アイコンを入れたい場合はここに：tab.icon && <tab.icon className="h-5 w-5 mb-0.5" /> */}
                <span className="truncate">{tab.label}</span>

                {/* アクティブ下線インジケータ */}
                <span
                  className={[
                    "mt-1 h-0.5 w-15 rounded-full transition-opacity", // ← 長めに変更
                    active ? "opacity-90 bg-pink-400/80" : "opacity-0",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
