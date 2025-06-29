import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import TypedDict, List, Dict, Union
import re

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
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(base_url, headers=headers)
    if response.status_code != 200:
        print("ページの取得に失敗しました")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    results: List[WorkInfo] = []

    # 各作品の親要素を取得
    work_entries = soup.find("ul", id="search_result_img_box")
    print(len(work_entries.find_all("li")))

    # 見つけた product_id を記録するセット
    seen_ids = set()
    unique_li_list = []

    for li in work_entries.find_all("li"):
        product_id = li.get("data-list_item_product_id")
        if product_id and product_id not in seen_ids:
            seen_ids.add(product_id)
            unique_li_list.append(li)

    print(f"ユニークな li 要素数: {len(unique_li_list)}")

    for work in unique_li_list:

        # work = work.find("dl", class_="work_img_main")

        # タイトルとDLリンク
        title = ""
        DL_link = ""
        title_div = work.find("div", class_="multiline_truncate")
        if title_div:
            a_tag = title_div.find("a")
            if a_tag:
                title = a_tag.get_text(strip=True)
                DL_link = urljoin(base_url, a_tag.get("href", ""))

        # RJ番号
        RJ_number = ""
        if DL_link:
            match = re.search(r"RJ\d+", DL_link)
            if match:
                RJ_number = match.group(0)

        # サムネイル画像リンク
        thumbnail_link = ""
        thumb_img = work.find("img", class_="lazy")
        if thumb_img and thumb_img.has_attr("src"):
            thumbnail_link = thumb_img["src"]

        # 評価数
        reputation_sum = ""
        rating_div = work.find("div", class_="star_rating star_50 mini")
        if rating_div:
            match = re.search(r"\((\d+)\)", rating_div.get_text(strip=True))
            if match:
                reputation_sum = match.group(1)

        # サークル名と声優名
        circle = ""
        character_voice = ""
        info_div = work.find("dd", class_="maker_name")
        if info_div:
            info_text = info_div.get_text(strip=True)
            parts = info_text.split("/")
            if len(parts) == 2:
                circle = parts[0].strip()
                character_voice = parts[1].strip()
            else:
                circle = info_text

        results.append({
            "title": title,
            "RJ_number": RJ_number,
            "DL_link": DL_link,
            "thumbnail_link": thumbnail_link,
            "reputation_sum": reputation_sum,
            "circle": circle,
            "character_voice": character_voice,
        })
    
    for result in results:
        print(result)
    print(len(results))
    return results

#音声作品編
#　本番なし 528
# 男性受け 156
# 逆レ 115
# 乳首責め 523
# 言葉責め 144
# 純愛 032
# ハーレム 046
# 複数プレイ 116
# おねショタ 504
# 人外娘/モンスター娘 317
# 快楽落ち 526
#　女性優位　536
# 触手 162
#　SM 136
#　逆転なし　433
#　羞恥/恥辱　149
#　拘束　146
#　オナサポ　514
#　ざぁ〜こ　525
#　おほごえ　524
# ヤンデレ　316
#　トランス/暗示　157
#　トランス/暗示ボイス　314
# 風俗/ソープ 447

#漫画編
#羞恥/恥辱　149
#露出　143
#男の娘　303
#女装　111
#ぶっかけ　126
#百合　158
#つるぺた　207
#女性視点　060
#おもちゃ　263
#拘束　146
#本番なし　528
#連続絶頂　070
#命令/無理やり　114

def make_tag_url(work_type: str, tags: List[int]) -> str:
    tag_segments = [f"/genre[{i}]/{tag}" for i, tag in enumerate(tags)]

    # tag_segments = []
    # for i, tag in enumerate([156, 523, 144]):
    #     tag_segments.append(f"/genre[{i}]/{tag}")

    # for i in range(len(tags)):
    #     tag_segments.append(f"/genre[{i}]/{tags[i]}")

    print(tag_segments)
    tag_path = ".join(tag_segments)
    print(tag_path)

    tags_url = f"https://www.dlsite.com/maniax/fsr/=/age_category[0]/adult/order/trend/work_type_category[0]/{work_type}{tag_path}/options[0]/JPN/options[1]/NM/release_term/month/from/work.genre"
    print(tags_url)

    return tags_url

    


if __name__ == "__main__":
    # url = make_tag_url("audio", [156, 144])
    url = make_tag_url("audio", [156, 523, 144])
    # print(url)
    # scraping_dlsite_ranking(url)