import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';

export default function Header() {
  return (
    // 背景は黒強め(gray-950)のまま、ボーダーをテーマカラーに合わせて変更
    <header className="bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50 border-b border-fuchsia-800/40">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
        {/* ホームへのリンク */}
        <Link href="/" className="text-2xl font-bold tracking-wider group">
          {/* グラデーションを青系から鮮やかなピンク系に変更 */}
          <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
            DLR
          </span>
        </Link>
        
        {/* お気に入りページへのリンク（テキストとアイコン） */}
        <Link 
          href="/favorites" 
          // アイコンとテキストの色を赤からピンク系に変更し、ホバーで少し明るく
          className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors duration-300 text-base font-bold"
        >
          <FaHeart className="text-xl" />
          <span>リスト</span>
        </Link>
      </nav>
    </header>
  );
}