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
      - (MUST) `AWS_BEDROCK_REGION` には bedrock の利用リージョンを指定
      - (MUST) `AWS_ACCESS_KEY_ID` に Amplifyを操作できるユーザ のアクセスキーを設定
      - (MUST) `AWS_SECRET_ACCESS_KEY` に に Amplifyを操作できるユーザ のシークレットアクセスキーを設定
      - (WANT) `ALLOW_ORIGINS` は Access-Control-Allow-Origin の設定値 を指定
      - (WANT) `SAGEMAKER_ENDPOINT_NAME` は SageMaker エンドポイント名 を指定ください。
      - (WANT) `ANTHROPIC_API_KEY` Anthropicを利用する場合のみご指定ください。
      - (WANT) `LLM` は、rinna, claude, claude_bedrock を指定可能。Anthropic を利用する場合は claudeを指定ください。
4. `./build_and_run.sh`
5. `http://localhost:8080` でサーバーが起動します。

> 補足
> `amplify/backend/api/fargate/src/docker-compose.yml` はローカル開発には利用できないのでご注意ください。理由は本ドキュメント後方に記載した「補足 docker-compose.ymlの用途について」を参照ください

## ローカル開発　(直接起動するパターン)

環境設定について
1. 前提、python 3.10 以上の環境を準備お願いします。
2. `cd amplify/backend/api/fargate/src/langchain/app`
3. `pip install -r requirements.txt` で依存パッケージのインストールお願いします

実行する
1. 環境変数を出力ください
    ```zsh
    # AWS_REGION は AWS のリージョンを指定 (Kendra や SageMaker が動いている)
    export AWS_REGION="us-west-2"
    export AWS_BEDROCK_REGION="us-west-2"
    # ALLOW_ORIGINS は Access-Control-Allow-Origin の設定値 を指定
    export ALLOW_ORIGINS="*"
    # SAGEMAKER_ENDPOINT_NAME  は SageMaker エンドポイント名 を指定
    export SAGEMAKER_ENDPOINT_NAME="Rinna-Inference"
    # export ANTHROPIC_API_KEY="xxxxxx"  # Claude を利用するための API Key がセットされていればこちらに値をセットする
    export LLM="rinna" # rinna, claude, claude_bedrock から指定可能ください。Anthropic を利用する場合は claudeを指定ください。
    ```
    
2. プログラムを実行する (FASTAPI)
    ```
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
                "AWS_BEDROCK_REGION": "us-west-2",
                "ALLOW_ORIGINS": "*",
                "SAGEMAKER_ENDPOINT_NAME": "Rinna-Inference",
                "LLM": "rinna",
                // "ANTHROPIC_API_KEY" : "",
            },
            "jinja": true,
            "justMyCode": true
        }
    ]
}
```


## 補足 docker-compose.ymlの用途について

`amplify/backend/api/fargate/src/docker-compose.yml` はローカル開発ではご利用頂けないのでご注意ください。
