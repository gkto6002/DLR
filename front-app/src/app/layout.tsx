import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

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
      </body>
    </html>
  );
}
