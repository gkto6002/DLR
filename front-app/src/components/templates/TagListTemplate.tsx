import { TagButton } from "../ui/TagButton";

type Tag = {
  id: string;
  name: string;
};

type Props = {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string) => void;
  onShowMore: () => void;
};

/**
 * タグの一覧を表示するためのテンプレート
 * @param tags - 表示するタグの配列
 * @param selectedTagId - 現在選択されているタグのID
 * @param onSelectTag - タグが選択されたときのイベントハンドラ
 * @param onShowMore - 「もっと見る」がクリックされたときのイベントハンドラ
 */
export const TagListTemplate = ({ tags, selectedTagId, onSelectTag, onShowMore }: Props) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">タグを選択</h2>
      <div className="flex flex-wrap gap-3 items-center">
        {tags.map((tag) => (
          <TagButton
            key={tag.id}
            label={tag.name}
            isActive={tag.id === selectedTagId}
            onClick={() => onSelectTag(tag.id)}
          />
        ))}
        <button onClick={onShowMore} className="text-green-600 text-sm hover:underline">
          もっと見る
        </button>
      </div>
    </div>
  );
};