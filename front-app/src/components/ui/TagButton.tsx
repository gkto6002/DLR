type Props = {
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

/**
 * タグを表示するためのUIコンポーネント
 * @param label - ボタンに表示するテキスト
 * @param isActive - 選択状態かどうか
 * @param onClick - クリック時のイベントハンドラ
 */
export const TagButton = ({ label, isActive = false, onClick }: Props) => {
  // 選択状態に応じてスタイルを動的に変更
  const baseStyle = "px-4 py-2 border rounded-full text-sm font-medium transition-colors";
  const activeStyle = "bg-green-500 text-white border-green-500";
  const inactiveStyle = "bg-white text-gray-700 border-gray-400 hover:bg-gray-100";

  return (
    <button
      className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};