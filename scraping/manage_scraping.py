import json
import logging
import boto3
from typing import List, Dict

# ロギング設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict, context):
    """
    DLsiteスクレイピングLambda関数を、定義されたtag_setsの各要素に対して呼び出すLambda関数。
    """

    # 呼び出すLambda関数のARNまたは名前
    # ここを、先ほど作成したスクレイピングLambda関数のARNまたは名前に置き換えてください。
    # 例: 'arn:aws:lambda:ap-northeast-1:123456789012:function:DLSiteScraperFunction'
    # または 'DLSiteScraperFunction'
    SCRAPER_LAMBDA_FUNCTION_NAME = "scraping" # あなたのスクレイピングLambda関数の名前に変更してください

    tag_sets: List[List[str]] = [
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

    lambda_client = boto3.client('lambda')
    
    invocation_results: List[Dict] = []

    for tags in tag_sets:
        payload = {
            "tags": tags,
            "work_type": "audio" # 必要に応じてeventから取得するか、固定値を設定
        }
        
        try:
            logger.info(f"Lambda関数 '{SCRAPER_LAMBDA_FUNCTION_NAME}' をタグ: {tags} で呼び出します。")
            
            # Lambda関数を非同期で呼び出す (InvocationType='Event')
            # 'RequestResponse' にすると同期呼び出しになり、呼び出し元のLambdaが完了を待つ
            response = lambda_client.invoke(
                FunctionName=SCRAPER_LAMBDA_FUNCTION_NAME,
                InvocationType='Event', # 非同期呼び出し
                Payload=json.dumps(payload)
            )
            
            status_code = response['StatusCode']
            if status_code == 202: # 202は非同期呼び出しが正常に受け付けられたことを示す
                logger.info(f"タグ {tags} の呼び出しに成功しました (ステータスコード: {status_code})。")
                invocation_results.append({
                    "tags": tags,
                    "status": "invoked_successfully",
                    "statusCode": status_code
                })
            else:
                logger.error(f"タグ {tags} のLambda呼び出しに失敗しました (ステータスコード: {status_code})。レスポンス: {response}")
                invocation_results.append({
                    "tags": tags,
                    "status": "invocation_failed",
                    "statusCode": status_code,
                    "response": response
                })

        except Exception as e:
            logger.error(f"タグ {tags} のLambda呼び出し中にエラーが発生しました: {e}")
            invocation_results.append({
                "tags": tags,
                "status": "error_during_invocation",
                "error": str(e)
            })
            
    logger.info(f"すべてのタグセットのLambda呼び出しを完了しました。結果: {invocation_results}")
    
    # 必要に応じて、Slack通知を追加することも可能ですが、
    # 各スクレイピングLambda関数が個別に通知を出すのでここでは省略。
    # ここでまとめて通知する場合は、invocation_resultsを使って集計する。

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"{len(tag_sets)}個のスクレイピングLambda関数の呼び出しを試行しました。",
            "invocation_details": invocation_results
        })
    }