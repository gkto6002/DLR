import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import BackToTopButton from "@/components/ui/BackToTopButton";

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
      {/* 背景色はピンクが映える黒強め(gray-900)のまま */}
      <body className={`${inter.className} text-gray-200`} style={{backgroundColor: '#0c010cff'}}>
        <Header />
        {children}
        
        <BackToTopButton />
      </body>
    </html>
  );
}