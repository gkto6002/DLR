import RankingCard from "@/components/ui/RankingCard";
import { RankingJson } from "@/types/ranking";

type RankingListProps = {
  items: RankingJson[];
  type?: "ranking" | "favorite"
};

export default function CardList({ items, type="ranking"}: RankingListProps) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">ランキングデータがありません。</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <RankingCard key={item.RJ_number} rank={index + 1} item={item} type={type}/>
      ))}
    </div>
  );
}
