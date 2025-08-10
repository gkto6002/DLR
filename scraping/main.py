import json
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import TypedDict, List, Dict # Dictをインポート
import re
import boto3
from datetime import datetime
import time

# ロギング設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class WorkInfo(TypedDict):
    title: str
    RJ_number: str
    DL_link: str
    thumbnail_link: str
    reputation_sum: int
    circle: str
    character_voice: List[str]
    tags: List[str]

def scraping_dlsite_ranking(base_url: str) -> List[WorkInfo]:
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(base_url, headers=headers)
    if response.status_code != 200:
        logger.error(f"ページの取得に失敗しました。ステータスコード: {response.status_code}, URL: {base_url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    results: List[WorkInfo] = []

    work_entries = soup.find("ul", id="search_result_img_box")
    if not work_entries:
        logger.warning(f"該当要素が見つかりませんでした。URL: {base_url}")
        return []

    seen_ids = set()
    unique_li_list = []

    for li in work_entries.find_all("li"):
        product_id = li.get("data-list_item_product_id")
        if product_id and product_id not in seen_ids:
            seen_ids.add(product_id)
            unique_li_list.append(li)

    logger.info(f"ユニークな li 要素数: {len(unique_li_list)}")

    for work in unique_li_list:
        title, DL_link, RJ_number = "", "", ""
        title_div = work.find("div", class_="multiline_truncate")
        if title_div:
            a_tag = title_div.find("a")
            if a_tag:
                title = a_tag.get_text(strip=True)
                DL_link = urljoin(base_url, a_tag.get("href", ""))
                match = re.search(r"RJ\d+", DL_link)
                if match:
                    RJ_number = match.group(0)

        thumbnail_link = ""
        thumb_img = work.find("img", class_="lazy")
        if thumb_img and thumb_img.has_attr("src"): # 'src'を使用するサイトもあるため変更
            thumbnail_link = thumb_img["src"] # ここを修正

        reputation_sum = 0
        rating_div = work.find("div", class_="star_rating") # class名が可変なのでより汎用的に
        if rating_div:
            match = re.search(r"\((\d+)\)", rating_div.get_text(strip=True))
            if match:
                reputation_sum = int(match.group(1))

        circle, character_voice = "", ""
        info_div = work.find("dd", class_="maker_name")
        if info_div:
            info_text = info_div.get_text(strip=True)
            parts = info_text.split("/")
            if len(parts) == 2:
                circle = parts[0].strip()
                character_voice = parts[1].strip()
            else:
                circle = info_text
        
        # 必須情報が取得できない場合はスキップ
        if not RJ_number or not title:
            logger.warning(f"作品の必須情報が不足しているためスキップ: {title_div.get_text() if title_div else 'N/A'}")
            continue

        results.append({
            "title": title,
            "RJ_number": RJ_number,
            "DL_link": DL_link,
            "thumbnail_link": thumbnail_link,
            "reputation_sum": reputation_sum,
            "circle": circle,
            "character_voice": character_voice,
        })

    logger.info(f"取得した作品数: {len(results)}")

    for work in results:
        work_url = work["DL_link"]

        headers = {
        "User-Agent": "Mozilla/5.0"
        }
        response = requests.get(work_url, headers=headers)

        if response.status_code != 200:
            logger.error(f"ページの取得に失敗しました。ステータスコード: {response.status_code}, URL: {work_url}")
            work["tags"] = [""]
            continue

        soup = BeautifulSoup(response.text, 'html.parser')




        work_tags = []
        # tag_div が見つかるかまずデバッグで確認する
        tag_div = soup.find("div", class_="main_genre")
        if not tag_div:
            logger.error(f"クラス 'genre_list_scroll' の div 要素が見つかりませんでした。URL: {work_url}")
            work["tags"] = [] # エラー時は空リストにするのが一般的
            continue 
        
        a_tags = tag_div.find_all("a")
        if not a_tags:
            logger.warning(f"クラス 'tag_genre' の a タグが 'genre_list_scroll' 内に見つかりませんでした。URL: {work_url}")
            work_tags = [] # 見つからない場合は空リスト
        else:
            for a_tag in a_tags:
                # get_text(strip=True) で取得を試みる
                tag_name = a_tag.get_text(strip=True)
                if tag_name:
                    work_tags.append(tag_name)
                else:
                    logger.warning(f"空のタグ名が検出されました。aタグのHTML: {a_tag}")
        
        # work_tags が空の場合もログ出力
        if not work_tags:
            logger.warning(f"最終的に取得されたタグリストが空でした。URL: {work_url}")

        work["tags"] = work_tags

        work["character_voice"] = extract_voice_actors(response.text)



    return results

def make_tag_url(work_type: str, tags: List[str]) -> str:
    tag_segments = [f"/genre[{i}]/{tag}" for i, tag in enumerate(tags)]
    tag_path = "".join(tag_segments)
    tags_url = (
        f"https://www.dlsite.com/maniax/fsr/=/age_category[0]/adult/order/trend/"
        f"work_type_category[0]/{work_type}{tag_path}/options[0]/JPN/options[1]/NM/release_term/month/from/work.genre"
    )
    logger.info(f"生成されたURL: {tags_url}")
    return tags_url

SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"
# Slackにメッセージを送信するヘルパー関数
def send_slack_notification(message: str, status: str = "success"):
    if not SLACK_WEBHOOK_URL:
        print("SLACK_WEBHOOK_URLが設定されていません。Slack通知をスキップします。")
        return

    color = "#36a64f" if status == "success" else "#ff0000" # 緑か赤

    slack_payload = {
        "attachments": [
            {
                "fallback": message,
                "color": color,
                "pretext": f"Lambda実行結果: {status.upper()}",
                "title": "DLsite Scraper Lambda Notification",
                "text": message,
                "ts": datetime.now().timestamp() # Unixタイムスタンプ
            }
        ]
    }

    try:
        response = requests.post(
            SLACK_WEBHOOK_URL,
            data=json.dumps(slack_payload),
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status() # HTTPエラーが発生した場合に例外を発生させる
        print(f"Slack通知を送信しました。ステータスコード: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Slack通知の送信に失敗しました: {e}")


def extract_voice_actors(html_content: str) -> List[str]:
    """
    DLsiteの作品詳細ページHTMLから声優情報を抽出する関数。
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    voice_actors = []

    # id="work_outline" のテーブルを探す
    work_outline_table = soup.find("table", id="work_outline")

    if not work_outline_table:
        print("Error: 'work_outline' テーブルが見つかりませんでした。")
        return []

    # 各tr要素をループ
    # tbodyがある場合はtbody.find_all('tr')、ない場合はtable.find_all('tr')
    # DLsiteのHTMLはtbodyがあることが多いので、それを前提とします。
    tr_elements = work_outline_table.find("tbody").find_all("tr") if work_outline_table.find("tbody") else work_outline_table.find_all("tr")

    for tr in tr_elements:
        # thタグがあり、そのテキストが「声優」または「出演」など声優に関連するラベルか確認
        # DLsiteの構造を考えると、<th>の声優ラベルで判別するのが最も確実です。
        th_tag = tr.find("th")
        if th_tag and "声優" in th_tag.get_text(strip=True):
            # 同じtr内のtdタグを取得
            td_tag = tr.find("td")
            if td_tag:
                # tdタグ内のaタグから声優名を取得
                a_tags = td_tag.find_all("a")
                if a_tags:
                    for a_tag in a_tags:
                        voice_actor_name = a_tag.get_text(strip=True)
                        if voice_actor_name:
                            voice_actors.append(voice_actor_name)
                else:
                    # aタグがない場合（稀ですが、直接テキストの場合）
                    # 例: 陽向葵ゆか / 柚木つぼめ のような区切りがある場合
                    # ここはあなたの元のコードでのサークル名取得ロジックに近い
                    td_text = td_tag.get_text(strip=True)
                    if td_text:
                        # スラッシュで分割して複数の声優を扱う
                        parts = [p.strip() for p in td_text.split('/') if p.strip()]
                        voice_actors.extend(parts)
            break # 声優情報を持つtrを見つけたらループを終了 (通常は一つだけのはず)

    return voice_actors

def lambda_handler(event: Dict, context): # eventの型ヒントを追加
    tag_sets = [
        ["528"],  # 本番なし
        ["156"],  # 男性受け
        ["115"],  # 逆レ
        ["523"],  # 乳首責め
        ["144"],  # 言葉責め
        ["032"],  # 純愛
        ["046"],  # ハーレム
        ["116"],  # 複数プレイ
        ["504"],  # おねショタ
        ["317"],  # 人外娘/モンスター娘
        ["526"],  # 快楽落ち
        ["536"],  # 女性優位
        ["162"],  # 触手
        ["136"],  # SM
        ["433"],  # 逆転なし
        ["149"],  # 羞恥/恥辱
        ["146"],  # 拘束
        ["514"],  # オナサポ
        ["525"],  # ざぁ〜こ
        ["524"],  # おほごえ
        ["316"],  # ヤンデレ
        ["157"],  # トランス/暗示
        ["314"],  # トランス/暗示ボイス
        ["447"],  # 風俗/ソープ
    ]

    work_type = event.get("work_type", "audio")

    now = datetime.now()
    day = now.day
    year = now.year
    month = now.month

    if 1 <= day <= 15:
        label_month = (month - 1) or 12
        label_year = year if month > 1 else year - 1
        label = f"{str(label_year)[2:]}{str(label_month).zfill(2)}late"
    else:
        label = f"{str(year)[2:]}{str(month).zfill(2)}early"

    bucket_name = "dlr-bucket-tokyo"
    s3 = boto3.client("s3")

    # ★ここから追加・変更部分★
    # 各タグセットの作品数を記録するためのリスト
    tag_counts_data: List[Dict[str, any]] = [] 
    # ★ここまで追加・変更部分★

    for tags in tag_sets:
        success = False
        current_tag_work_count = 0 # 現在のタグセットの作品数を記録する変数
        
        for attempt in range(3):
            try:
                logger.info(f"タグ {tags} の試行 {attempt + 1} 回目")
                url = make_tag_url(work_type, tags)
                works = scraping_dlsite_ranking(url)

                current_tag_work_count = len(works) # 取得できた作品数を記録

                if not works:
                    logger.warning(f"タグ {tags} の作品が0件でした")
                    success = True
                    break

                json_data = json.dumps(works, ensure_ascii=False, indent=2)
                tag_filename = "_".join(tags) + ".json"
                key = f"dlsite_data/{label}/{tag_filename}"

                s3.put_object(
                    Bucket=bucket_name,
                    Key=key,
                    Body=json_data.encode("utf-8"),
                    ContentType="application/json"
                )
                logger.info(f"S3に保存完了: s3://{bucket_name}/{key}")
                success = True
                break

            except Exception as e:
                logger.warning(f"タグ {tags} の試行 {attempt + 1} 回目で失敗: {e}")
                time.sleep(1)

        # ★ここから追加・変更部分★
        # 各タグセットの処理結果をtag_counts_dataに追加
        tag_counts_data.append({
            "tag_id": "_".join(tags), # タグの識別子（例: "156" や "032_046"）
            "work_count": current_tag_work_count, # 取得できた作品数
            "timestamp": now.isoformat(), # 処理日時
            "status": "success" if success else "failed" # 成功/失敗ステータス
        })
        # ★ここまで追加・変更部分★

        if not success:
            logger.error(f"タグ {tags} の処理が3回失敗しました。次に進みます。")
            send_slack_notification(f"タグ {tags} の処理が3回失敗しました。次に進みます。", status="error") # ステータスをerrorに変更

    # ★ここから追加・変更部分★
    # すべてのタグセットの処理が完了した後、tag_counts.jsonを保存
    tag_counts_json_data = json.dumps(tag_counts_data, ensure_ascii=False, indent=2)
    tag_counts_key = f"dlsite_data/{label}/tag_counts.json" # 保存するファイルのキー

    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=tag_counts_key,
            Body=tag_counts_json_data.encode("utf-8"),
            ContentType="application/json"
        )
        logger.info(f"S3にタグカウント情報を保存完了: s3://{bucket_name}/{tag_counts_key}")
        send_slack_notification(f"S3にタグカウント情報 ({len(tag_sets)}タグセット分) を保存しました。", status="success")
    except Exception as e:
        logger.error(f"タグカウント情報のS3保存に失敗しました: {e}")
        send_slack_notification(f"タグカウント情報のS3保存に失敗しました: {e}", status="error")
    # ★ここまで追加・変更部分★

    send_slack_notification(f"{len(tag_sets)}セットの保存処理を実施しました", status="success") # 最終的な成功通知も追加
    return {
        "statusCode": 200,
        "body": f"{len(tag_sets)}セットの保存処理を実施しました"
    }

# --- ここからがローカルテスト用のコード ---
# if __name__ == "__main__":
#     print("--- ローカルテスト開始: 特定のURLをスクレイピング ---")

#     # テストしたいDLsiteのランキングURLをここに設定します
#     # 例: 音声作品のトレンドランキング
#     # test_url = "https://www.dlsite.com/maniax/fsr/=/age_category[0]/adult/order/trend/work_type_category[0]/audio/options[0]/JPN/options[1]/NM/release_term/month"

#     # 例: 特定のタグ（男性受け）の音声作品ランキング
#     test_tags = ["156"] # 男性受けのタグID
#     test_work_type = "audio"
#     test_url = make_tag_url(test_work_type, test_tags)


#     logger.info(f"テスト対象URL: {test_url}")

#     try:
#         scraped_data = scraping_dlsite_ranking(test_url)

#         print("\n--- スクレイピング結果 ---")
#         if scraped_data:
#             # 最初の数件のみ表示して確認
#             for i, work in enumerate(scraped_data[:5]): # 最初の5件だけ表示
#                 print(f"--- 作品 {i+1} ---")
#                 print(f"  タイトル: {work.get('title')}")
#                 print(f"  RJ番号: {work.get('RJ_number')}")
#                 print(f"  DLリンク: {work.get('DL_link')}")
#                 print(f"  サムネイル: {work.get('thumbnail_link')}")
#                 print(f"  評価数: {work.get('reputation_sum')}")
#                 print(f"  サークル: {work.get('circle')}")
#                 print(f"  声優: {work.get('character_voice')}")
#                 print(f"  タグ: {', '.join(work.get('tags', []))}")
#                 print("-" * 20)
            
#             if len(scraped_data) > 5:
#                 print(f"... 他に {len(scraped_data) - 5} 件の作品があります。")

#             # 全てのデータをJSON形式で出力したい場合
#             # print("\n--- 全てのデータ (JSON) ---")
#             # print(json.dumps(scraped_data, ensure_ascii=False, indent=2))
#         else:
#             print("スクレイピング結果は空でした。ログを確認してください。")

#     except Exception as e:
#         logger.error(f"ローカルテスト中に予期せぬエラーが発生しました: {e}")

#     print("--- ローカルテスト終了 ---")