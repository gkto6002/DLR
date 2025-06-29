import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import TypedDict, List


# 作品情報の型
class WorkInfo(TypedDict):
    title: str
    RJ_number: str
    DL_link: str
    thumbnail_link: str
    reputation_sum: int
    circle: str
    character_voice: str


def scraping_dlsite_ranking(base_url: str) -> List[WorkInfo]:
    """
    指定したURLから作品情報のリストを抽出する。

    Args:
        base_url (str): ランキングページのURL

    Returns:
        List[WorkInfo]: 作品情報のリスト
    """

    response = requests.get(base_url, headers={'User-Agent': 'Mozilla/5.0'})
    if response.status_code != 200:
        print("ページの取得に失敗しました")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    work_list = []

    # 各作品を含むブロック（product-list__item）を探す
    items = soup.find_all("li", class_="n_work")

    for item in items:
        try:
            # タイトルとリンク
            title_tag = item.find("span", class_="work_name")
            title = title_tag.text.strip() if title_tag else "不明"

            link_tag = item.find("a", href=True)
            DL_link = urljoin(base_url, link_tag["href"]) if link_tag else ""

            # RJ番号（リンク内に含まれている）
            RJ_number = ""
            if link_tag:
                RJ_number = link_tag["href"].split("/")[-1]

            # サムネイル画像
            thumb_tag = item.find("img")
            thumbnail_link = thumb_tag["src"] if thumb_tag and "src" in thumb_tag.attrs else ""

            # サークル名
            circle_tag = item.find("span", class_="maker_name")
            circle = circle_tag.text.strip() if circle_tag else "不明"

            # 評価数（レビュー数）
            rep_tag = item.find("span", class_="review-count")
            if rep_tag:
                rep_text = rep_tag.text.strip().replace("件", "").replace(",", "")
                reputation_sum = int(rep_text) if rep_text.isdigit() else 0
            else:
                reputation_sum = 0

            # 声優（出演者）名
            chara_voice_tag = item.find("span", class_="performer")
            character_voice = chara_voice_tag.text.strip() if chara_voice_tag else "不明"

            work = WorkInfo(
                title=title,
                RJ_number=RJ_number,
                DL_link=DL_link,
                thumbnail_link=thumbnail_link,
                reputation_sum=reputation_sum,
                circle=circle,
                character_voice=character_voice
            )

            work_list.append(work)
        except Exception as e:
            print(f"エラーが発生しました: {e}")
            continue

    return work_list


if __name__ == "__main__":
    BASE_URL = "https://www.dlsite.com/maniax/fsr/=/age_category[0]/adult/order/trend/work_type_category[0]/audio/options[0]/JPN/options[1]/NM/release_term/month/from/work.genre"
    results = scraping_dlsite_ranking(BASE_URL)
    for work in results:
        print(work)
