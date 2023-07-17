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


## ローカル開発　（Docker利用するパターン）

1. `cd amplify/backend/api/fargate/src/langchain`
2. `cp .env.development-template .env`
3. `.env` ファイルを編集
      - (MUST) `AWS_REGION` は AWS のリージョンを指定(Kendra や SageMaker が動いている)
      - (MUST) `KENDRA_INDEX_ID` を Kendra の Index ID に指定
      - (WANT) `ALLOW_ORIGINS` は Access-Control-Allow-Origin の設定値 を指定
      - (WANT) `SAGEMAKER_ENDPOINT_NAME` は SageMaker エンドポイント名 を指定ください。
      - (WANT) `ANTHROPIC_API_KEY` Anthropicを利用する場合のみご指定ください。
      - (WANT) `LLM` は、rinna か claude を指定可能。 Anthropic を利用する場合は claudeを指定ください。
4. `./build_and_run.sh`
5. `http://localhost:8000` でサーバーが起動します。


## ローカル開発　(直接起動するパターン)

```zsh
# AWS_REGION は AWS のリージョンを指定 (Kendra や SageMaker が動いている)
export AWS_REGION="us-west-2"
# ALLOW_ORIGINS は Access-Control-Allow-Origin の設定値 を指定
export ALLOW_ORIGINS="*"
# SAGEMAKER_ENDPOINT_NAME  は SageMaker エンドポイント名 を指定
export SAGEMAKER_ENDPOINT_NAME="Rinna-Inference"
# KENDRA_INDEX_ID  を Kendra の Index ID に指定
export KENDRA_INDEX_ID=*********
# export ANTHROPIC_API_KEY="xxxxxx"  # Claude を利用するための API Key がセットされていればこちらに値をセットする
export LLM="rinna" # rinna か claude を指定可能ください。Anthropic を利用する場合は claudeを指定ください。
cd ./server/app
uvicorn main:app --reload --port 8080
```

## ローカル開発　（VSCODE利用パターン)

VSCODEからデバッグ実行するには、
.vscode/launch.json を以下のように作成して、「実行とデバッグ」より「Run Rag BackEnd」を実行ください。
以下、"env" の環境変数の箇所は修正をお願い致します。
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Rag BackEnd",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "cwd": "${workspaceFolder}/amplify/backend/api/fargate/src/langchain/app/",
            "args": [
                "main:app",
                "--reload",
                "--port",
                "8080"
            ],
            "env": {
                "AWS_REGION": "us-west-2",
                "ALLOW_ORIGINS": "*",
                "SAGEMAKER_ENDPOINT_NAME": "Rinna-Inference",
                "KENDRA_INDEX_ID": "************",
                "LLM": "rinna",
                "AWS_REGION": "us-east-1"
                // "ANTHROPIC_API_KEY" : "",
            },
            "jinja": true,
            "justMyCode": true
        }
    ]
}
```

## 補足 docker-compose.yml の用途について

docker-compose.yml はローカル開発ではご利用頂けないのでご注意ください。

docker-compose.yml の中で、secret として宣言されている `KENDRA_INDEX_ID` は、
アプリ内では、`環境変数` として読み込む設計になっているため、docker-compose up を行なっても、`KENDRA_INDEX_ID` を発見できないエラーが発生して正しく動きません。
(docker-compose の secret は、本来、コンテナの /run/secret/配下にファイルをバインドする機能)

なぜ、このようになっているか？というと、Amplifyは docker-compose.yml を解析して、自動でデプロイ用の CloudFormation を作成するのですが、docker-compose で secret に設定すると、CloudFormation上は、SecretManager に格納する記述に変換される挙動をするため、セキュリティ的に高くなるのが理由です。
つまり、docker-compose.yml は デプロイ用の Amplify が CloudFormation を作成するための設定ファイルだとご認識ください。
