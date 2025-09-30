"use client";

import { useState, useEffect, CSSProperties } from 'react';

// --- Style Definitions ---
const baseStyle: CSSProperties = {
  position: 'fixed',
  right: '10px',
  bottom: '60px',
  width: '52px',
  height: '52px',
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  outline: 'none',
  zIndex: 50,
  transition: 'all 0.2s ease-in-out',
  // Reverted to the pink-based theme
  backgroundColor: 'rgba(29, 10, 20, 0.8)', // ピンク系ダーク背景
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(255, 105, 180, 0.3)', // ピンク系ボーダー
  color: '#f0d6e8', // アイコンの色
  backdropFilter: 'blur(10px)',
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  // Initially hidden
  opacity: 0,
  transform: 'translateY(20px)',
  pointerEvents: 'none',
};

const visibleStyle: CSSProperties = {
  ...baseStyle,
  opacity: 1,
  transform: 'translateY(0)',
  pointerEvents: 'auto',
};

const hoverStyle: CSSProperties = {
  ...visibleStyle,
  backgroundColor: 'rgba(255, 105, 180, 0.15)', // ホバー時にピンクっぽく
  borderColor: 'rgba(255, 105, 180, 0.7)',
  boxShadow: '0 0 15px rgba(255, 105, 180, 0.4)',
  transform: 'scale(1.1)',
};


export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentStyle = isVisible 
    ? (isHovered ? hoverStyle : visibleStyle) 
    : baseStyle;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={currentStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="ページ上部へ戻る"
      title="ページ上部へ戻る"
    >
      {/* カスタムSVGアイコン */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* 下辺のない三角形（シェブロン） */}
        <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* TOPの文字（fontSizeを大きく） */}
        <text x="12" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">TOP</text>
      </svg>
    </button>
  );
}
