import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Script from "next/script"; // ★ 追加

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DLsite Ranking Viewer",
  description: "A viewer for DLsite rankings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* bodyにダークテーマの背景色とテキスト色を設定 */}
      <body className={`${inter.className} bg-gray-900 text-gray-200`}>
        <Header />
        {children}

        {/* ★ 追加: “上に行く”ボタン（ページの半分を超えたら表示） */}
        <Script id="back-to-top" strategy="afterInteractive">
          {`
            (function () {
              // すでに存在すれば二重作成しない
              if (document.getElementById('back-to-top-btn')) return;

              const btn = document.createElement('button');
              btn.id = 'back-to-top-btn';
              btn.type = 'button';
              btn.setAttribute('aria-label', 'ページ上部へ戻る');
              btn.title = 'ページ上部へ戻る';

              // 最低限のインラインスタイル（TailwindクラスはJS文字列内だとビルド対象外のため）
              Object.assign(btn.style, {
                position: 'fixed',
                right: '24px',
                bottom: '24px',
                padding: '12px',
                borderRadius: '9999px',
                background: '#334155', // slate-700
                color: '#e5e7eb',      // gray-200
                border: '1px solid #475569', // slate-600
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'none',
                zIndex: '50',
                transition: 'background 150ms ease'
              });

              btn.addEventListener('mouseenter', () => { btn.style.background = '#475569'; }); // slate-600
              btn.addEventListener('mouseleave', () => { btn.style.background = '#334155'; }); // slate-700
              btn.addEventListener('focus', () => { btn.style.outline = '2px solid #94a3b8'; }); // slate-400
              btn.addEventListener('blur', () => { btn.style.outline = 'none'; });

              // 矢印アイコン（SVG）
              btn.innerHTML = \`
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5c.3 0 .6.12.82.34l6 6a1.16 1.16 0 0 1-1.64 1.64L13 8.8V19a1.17 1.17 0 0 1-2.34 0V8.8l-4.18 4.18A1.16 1.16 0 1 1 4.84 11.34l6-6c.22-.22.52-.34.82-.34Z"/>
                </svg>\`;

              btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });

              document.body.appendChild(btn);

              const updateVisibility = () => {
                const doc = document.documentElement;
                const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
                const threshold = scrollable / 12; // ページ（スクロール可能領域）の半分
                if (window.scrollY > threshold) {
                  btn.style.display = 'flex';
                  btn.style.alignItems = 'center';
                  btn.style.justifyContent = 'center';
                } else {
                  btn.style.display = 'none';
                }
              };

              window.addEventListener('scroll', updateVisibility, { passive: true });
              window.addEventListener('resize', updateVisibility);
              updateVisibility();
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
