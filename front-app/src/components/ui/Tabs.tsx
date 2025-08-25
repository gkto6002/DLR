"use client";

import { useState, ReactNode } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
};

export default function Tabs({ tabs }: TabsProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div>
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
      <div>{tabs[activeTabIndex].content}</div>
    </div>
  );
}
