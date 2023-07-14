# JP RAG SAMPLE (Server)

## フォルダ構造

```zsh
.
├── Dockerfile  # Dockerコンテナを構築するための設定ファイル
├── NOTICE
├── README.md
├── app  # アプリケーションの主要なコードを格納
│   ├── chain  # chain を構築する際のコードを格納
│   │   ├── __init__.py
│   │   ├── claude.py  # claude を利用した chain の定義
│   │   └── rinna.py  # rinna を利用した chain の定義
│   ├── logics  # 各種 API ごとのロジックの詳細を定義したコードを格納
│   │   ├── __init__.py
│   │   └── llm_with_doc.py  # POST /llm-with-doc
│   ├── main.py  # アプリケーションのエントリーポイント
│   └── schemas.py  # アプリケーションのデータ構造を定義したファイル
├── build_and_run.sh  # ローカルでコンテナイメージを立ち上げて実行する手順を実行するスクリプト
├── requirements.txt  # 本番環境で必要なパッケージ
```

## ローカル開発

```zsh
export AWS_REGION="us-west-2"
export ALLOW_ORIGINS="http://localhost:5173"
export SAGEMAKER_ENDPOINT_NAME="Rinna-Inference"
export CALM_ENDPOINT_NAME="Open-calm-7b-ft3"
export KENDRA_INDEX_ID=d841dfc5-4de5-437e-932d-8ed079b83d91
export USERPOOL_ID="us-west-2_q2mjTYVnk"
export APP_CLIENT_ID="3gdg61djko2haf10mf16g1a2g1"
# export ANTHROPIC_API_KEY="xxxxxx"  # Claude を利用するための API Key がセットされていればこちらに値をセットする
export LLM="rinna" # Claude の API Key をセットしている場合は claude も選択できます
cd ./server/app
uvicorn main:app --reload
```

## ローカル開発（Docker）

環境変数は .env ファイルに反映し以下を実行。

```zsh
./build_and_run.sh
```