# JP RAG SAMPLE (Server)

## フォルダ構造

```zsh
.
├── Dockerfile  # Dockerコンテナを構築するための設定ファイル
├── NOTICE
├── README.md
├── app  # アプリケーションの主要なコードを格納
│   ├── chain  # chain を構築する際のコードを格納
│   │   ├── __init__.py
│   │   ├── claude.py  # claude を利用した chain の定義
│   │   └── rinna.py  # rinna を利用した chain の定義
│   ├── logics  # 各種 API ごとのロジックの詳細を定義したコードを格納
│   │   ├── __init__.py
│   │   └── llm_with_doc.py  # POST /llm-with-doc
│   ├── main.py  # アプリケーションのエントリーポイント
│   └── schemas.py  # アプリケーションのデータ構造を定義したファイル
├── build_and_run.sh  # ローカルでコンテナイメージを立ち上げて実行する手順を実行するスクリプト
├── ecr_push.sh  # Amazon ECR にコンテナイメージをビルドしてプッシュする手順を実行するスクリプト
├── requirements-dev.txt  # 開発環境で必要なパッケージ
├── requirements.txt  # 本番環境で必要なパッケージ
└── source.bat
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

## AWS 上で動かす方法（手動）

1. ECR のサービスコンソールに移動して、`jp-rag-sample` といったレポジトリを作成する (名前は自由)
2. IAM Role を新規作成する

EC2 のサービスロールとして作成し、必要な権限をアタッチする。

- KendraReadOnlyPolicy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "useEndpoint",
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpointAsync",
        "sagemaker:DescribeEndpoint",
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": "arn:aws:sagemaker:<region>:<account_id>:endpoint/jp-rag-sample*"
    },
    {
      "Sid": "listEndpoint",
      "Effect": "Allow",
      "Action": "sagemaker:ListEndpoints",
      "Resource": "*"
    }
  ]
}
```

作成した後、以下の Trusted Policy に変更する。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "tasks.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

3. App Runner のサービスコンソール画面に移動し、新規サービスを作成し、作成した ECR の指定をする。 Step2 のところの Security で先ほど作成した IAM Role を指定する。

## 開発したコンテナをデプロイする方法

```zsh
./ecr_push.sh
```

デプロイしたい AWS アカウント ID やリージョンについて入力をすると指定した ECR レポジトリにビルドしたコンテナイメージを push します。
