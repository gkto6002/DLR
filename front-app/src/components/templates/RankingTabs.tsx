import { RankingJson } from "@/types/ranking";
import CardList from "./CardList";
import Tabs from "../ui/Tabs";

type RankingTabsProps = {
  earlyItems: RankingJson[];
  lateItems: RankingJson[];
};

export default function RankingTabs({ earlyItems, lateItems }: RankingTabsProps) {
  const hasEarly = earlyItems.length > 0;
  const hasLate = lateItems.length > 0;

  // 両方ある場合のみタブを表示
  if (hasEarly && hasLate) {
    const tabs = [
      {
        label: "前半",
        content: <CardList items={earlyItems} />,
      },
      {
        label: "後半",
        content: <CardList items={lateItems} />,
      },
    ];
    return <Tabs tabs={tabs} />;
  }

  // 前半のみの場合
  if (hasEarly) {
    return <CardList items={earlyItems} />;
  }

  // 後半のみの場合
  if (hasLate) {
    return <CardList items={lateItems} />;
  }

  // データが何もない場合はnullを返す（親コンポーネントでメッセージ表示）
  return null;
}
