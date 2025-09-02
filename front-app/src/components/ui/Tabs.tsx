"use client";

import { useState, ReactNode, useEffect } from "react";

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
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // 初期表示時にも判定を実行
    handleScroll();

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []); // 空の依存配列で、初回レンダリング時にのみ実行

  // ▲ ここまで追加 ▲

  return (
    <div>
      {/* 1. 通常表示されるタブ */}
      <div className="flex justify-center border-b border-gray-700 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`py-2 px-6 font-semibold transition-colors duration-300 ${
              activeTabIndex === index
                ? "text-white border-b-2 border-pink-500"
                : "text-gray-600 hover:text-white"
            }`}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブに対応するコンテンツ */}
      <div>{tabs[activeTabIndex].content}</div>

      {/* 2. スクロール時に画面下部に表示される固定タブ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
          isFixed ? 'translate-y-0' : 'translate-y-full' // isFixedの状態に応じて上下にスライド
        }`}
        style={{
          backgroundColor: 'rgba(29, 10, 20, 0.8)', // BackToTopButtonのスタイルを参考
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', // Safari向け
        }}
      >
        <div className="flex justify-around border-t border-pink-500/30">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              className={`py-3 flex-1 font-semibold transition-colors duration-300 ${ // flex-1で幅を均等に
                activeTabIndex === index
                  ? "text-white bg-pink-500/20" // アクティブなタブを分かりやすく
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}