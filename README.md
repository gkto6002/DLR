# DLR
python ファイル名

## AWS Lambda に外部パッケージ（BeautifulSoupなど）をzipでアップロードして使う方法

このガイドでは、AWS Lambda 関数で `BeautifulSoup` や `requests` などの外部 Python パッケージを使用するために、zipファイルを作成してアップロードする手順を説明します。

---

### ✅ 前提条件

- Python（例: Python 3.9）がローカルにインストールされている
- `pip` が使える
- AWS アカウントと Lambda 関数作成権限がある

---

### 1. 作業ディレクトリの作成

```bash
mkdir lambda_bs4_package
cd lambda_bs4_package
```

### 2.必要なパッケージのインストール
```bash
pip install beautifulsoup4 requests -t .
```

### 3.関数を書いて圧縮
```bash
zip -r9 lambda_function.zip .
```

### 4.Lambdaにアップロード
コードソース」セクションで「アップロード」 → 「.zip ファイルをアップロード」を選択
