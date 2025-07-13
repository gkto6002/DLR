import json
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import TypedDict, List, Dict
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
        if thumb_img and thumb_img.has_attr("data-src"):
            thumbnail_link = thumb_img["data-src"]

        reputation_sum = 0
        rating_div = work.find("div", class_="star_rating")
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
            "tags": [] # 初期化
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
        tag_div = soup.find("div", class_="main_genre")
        if not tag_div:
            logger.error(f"クラス 'main_genre' の div 要素が見つかりませんでした。URL: {work_url}")
            work["tags"] = []
            continue 
        
        a_tags = tag_div.find_all("a")
        if not a_tags:
            logger.warning(f"クラス 'main_genre' 内に a タグが見つかりませんでした。URL: {work_url}")
            work_tags = []
        else:
            for a_tag in a_tags:
                tag_name = a_tag.get_text(strip=True)
                if tag_name:
                    work_tags.append(tag_name)
                else:
                    logger.warning(f"空のタグ名が検出されました。aタグのHTML: {a_tag}")
        
        if not work_tags:
            logger.warning(f"最終的に取得されたタグリストが空でした。URL: {work_url}")

        work["tags"] = work_tags
        work["character_voice"] = extract_voice_actors(response.text)

    return results

def make_tag_url(work_type: str, tags: List[str]) -> str:
    # tagsが空の場合のパスを調整
    if not tags:
        tag_path = ""
    else:
        tag_segments = [f"/genre[{i}]/{tag}" for i, tag in enumerate(tags)]
        tag_path = "".join(tag_segments)
    
    tags_url = (
        f"https://www.dlsite.com/maniax/fsr/=/age_category[0]/adult/order/trend/"
        f"work_type_category[0]/{work_type}{tag_path}/options[0]/JPN/options[1]/NM/release_term/month/from/work.genre"
    )
    logger.info(f"生成されたURL: {tags_url}")
    return tags_url

SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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" # 実際のURLに置き換えてください

def send_slack_notification(message: str, status: str = "success"):
    if not SLACK_WEBHOOK_URL:
        print("SLACK_WEBHOOK_URLが設定されていません。Slack通知をスキップします。")
        return

    color = "#36a64f" if status == "success" else "#ff0000"

    slack_payload = {
        "attachments": [
            {
                "fallback": message,
                "color": color,
                "pretext": f"Lambda実行結果: {status.upper()}",
                "title": "DLsite Scraper Lambda Notification",
                "text": message,
                "ts": datetime.now().timestamp()
            }
        ]
    }

    try:
        response = requests.post(
            SLACK_WEBHOOK_URL,
            data=json.dumps(slack_payload),
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        print(f"Slack通知を送信しました。ステータスコード: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Slack通知の送信に失敗しました: {e}")

def extract_voice_actors(html_content: str) -> List[str]:
    soup = BeautifulSoup(html_content, 'html.parser')
    voice_actors = []

    work_outline_table = soup.find("table", id="work_outline")

    if not work_outline_table:
        logger.debug("Debug: 'work_outline' テーブルが見つかりませんでした。")
        return []

    tr_elements = work_outline_table.find("tbody").find_all("tr") if work_outline_table.find("tbody") else work_outline_table.find_all("tr")

    for tr in tr_elements:
        th_tag = tr.find("th")
        if th_tag and "声優" in th_tag.get_text(strip=True):
            td_tag = tr.find("td")
            if td_tag:
                a_tags = td_tag.find_all("a")
                if a_tags:
                    for a_tag in a_tags:
                        voice_actor_name = a_tag.get_text(strip=True)
                        if voice_actor_name:
                            voice_actors.append(voice_actor_name)
                else:
                    td_text = td_tag.get_text(strip=True)
                    if td_text:
                        parts = [p.strip() for p in td_text.split('/') if p.strip()]
                        voice_actors.extend(parts)
            break
    return voice_actors

def lambda_handler(event: Dict, context):
    # eventからtag_setsとwork_typeを取得
    # 'tags'キーは必須とし、リストであることを期待
    # 'work_type'はオプションとし、デフォルトは'audio'
    
    # tagsはリストのリストとして想定されるが、今回は単一のタグセットを受け取る形式に変更
    # eventが {"tags": ["528"], "work_type": "audio"} の形式を想定
    
    tags_from_event = event.get("tags")
    work_type = event.get("work_type", "audio")

    if not tags_from_event or not isinstance(tags_from_event, list):
        logger.error("イベントに'tags'または不正な形式の'tags'が指定されていません。")
        send_slack_notification("Lambda関数: 'tags'がイベントに指定されていないか、不正な形式です。", status="error")
        return {
            "statusCode": 400,
            "body": json.dumps("Missing or invalid 'tags' in event. Expected a list of tag IDs.")
        }
    
    # tags_from_eventは ['528'] のような形式で来るので、tag_setsの要素として使えるようにする
    # このLambda関数は一度に一つのタグセットを処理する、という前提で修正します。
    # 複数のタグセットを一度に処理したい場合は、tag_setsをeventから受け取るように変更が必要です。
    target_tags = tags_from_event 

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

    bucket_name = "dlr-bucket-tokyo" # 実際のバケット名に置き換えてください
    s3 = boto3.client("s3")

    current_tag_work_count = 0
    success = False

    for attempt in range(3):
        try:
            logger.info(f"タグ {target_tags} の試行 {attempt + 1} 回目")
            url = make_tag_url(work_type, target_tags)
            works = scraping_dlsite_ranking(url)

            current_tag_work_count = len(works)

            if not works:
                logger.warning(f"タグ {target_tags} の作品が0件でした")
                success = True
                break

            json_data = json.dumps(works, ensure_ascii=False, indent=2)
            tag_filename = "_".join(target_tags) + ".json"
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
            logger.warning(f"タグ {target_tags} の試行 {attempt + 1} 回目で失敗: {e}")
            time.sleep(1)

    # 処理結果を保存
    tag_counts_data = {
        "tag_id": "_".join(target_tags),
        "work_count": current_tag_work_count,
        "timestamp": now.isoformat(),
        "status": "success" if success else "failed"
    }
    
    # 既存のtag_counts.jsonを読み込み、新しいデータを追加して保存するロジックを実装
    # (今回は単一のタグセット処理なので、シンプルに上書き、またはリストに追加する形式にするか検討)
    # ここでは、簡略化のため、この実行における単一のタグセットの結果だけをslackに通知する。
    # 複数タグセットの集計が必要な場合は、別途集計用のLambdaを設けるか、
    # DynamoDBなどの中間ストアにデータを保存することを検討してください。

    if not success:
        logger.error(f"タグ {target_tags} の処理が3回失敗しました。")
        send_slack_notification(f"タグ {target_tags} の処理が3回失敗しました。", status="error")
        return {
            "statusCode": 500,
            "body": json.dumps(f"Failed to process tags: {target_tags}")
        }
    else:
        send_slack_notification(f"タグ {target_tags} のスクレイピングが完了しました。作品数: {current_tag_work_count}", status="success")
        return {
            "statusCode": 200,
            "body": json.dumps(f"Successfully processed tags: {target_tags}, found {current_tag_work_count} works.")
        }