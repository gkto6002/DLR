import requests
from bs4 import BeautifulSoup
import json
import time

# --- 設定 ---
# 読み込むJSONファイルのパス
INPUT_JSON_PATH = '/Users/hyuta/Downloads/536.json'
# 結果を保存するJSONファイルのパス
OUTPUT_JSON_PATH = INPUT_JSON_PATH
# ----------------

# JSONファイルをパスから読み込む
try:
    with open(INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
        work_list = json.load(f)
except FileNotFoundError:
    print(f"エラー: ファイル '{INPUT_JSON_PATH}' が見つかりません。")
    print("JSONデータが記載されたファイルを同じディレクトリに配置し、ファイル名を合わせてください。")
    exit()
except json.JSONDecodeError:
    print(f"エラー: ファイル '{INPUT_JSON_PATH}' のJSON形式が正しくありません。")
    exit()

# HTTPリクエスト用のヘッダー
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8' # 日本語ページを優先
}

# 各作品をループしてサムネイルリンクを取得
for work in work_list:
    dlsite_link = work.get("DL_link")
    rj_number = work.get("RJ_number")

    if not dlsite_link:
        print(f"[{rj_number}] - DL_linkが見つかりません。スキップします。")
        continue

    print(f"[{rj_number}] - 処理中: {work.get('title')}")

    try:
        # ウェブページにアクセス
        response = requests.get(dlsite_link, headers=headers)
        response.raise_for_status()  # HTTPエラーがあれば例外を発生させる

        # BeautifulSoupでHTMLを解析
        soup = BeautifulSoup(response.text, 'html.parser')

        # CSSセレクタで目的のimg要素を特定
        img_element = soup.select_one('li.slider_item.active img')

        if img_element and img_element.get('srcset'):
            # 元のURLを取得
            original_url = img_element['srcset'].split(',')[0].strip().split(' ')[0]
            if original_url.startswith('//'):
                original_url = 'https:' + original_url

            # === ここからURLの変換処理 ===
            # 1. '/modpub/' を '/resize/' に置換
            resized_url = original_url.replace('/modpub/', '/resize/')
            # 2. '_img_main.jpg' を '_img_main_240x240.jpg' に置換
            resized_url = resized_url.replace('_img_main.jpg', '_img_main_240x240.jpg')
            # ==========================

            # JSONデータを更新
            work["thumbnail_link"] = resized_url
            print(f"  -> 成功: サムネイルリンクを取得しました。({resized_url})")
        else:
            work["thumbnail_link"] = "Thumbnail not found"
            print(f"  -> 失敗: サムネイル要素が見つかりませんでした。")

    except requests.exceptions.RequestException as e:
        work["thumbnail_link"] = f"Scraping failed: {e}"
        print(f"  -> エラー: スクレイピングに失敗しました。({e})")

    # サーバーに負荷をかけないように、リクエストごとに待機時間を設ける
    # time.sleep(1)

# 更新されたデータをファイルに保存
with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(work_list, f, indent=2, ensure_ascii=False)

print("\n--- 処理完了 ---")
print(f"更新されたデータが '{OUTPUT_JSON_PATH}' に保存されました。")