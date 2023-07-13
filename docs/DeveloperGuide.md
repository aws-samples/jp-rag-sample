# Developer Guide

## デプロイ

### 1. Kendra のインデックスを作成

1. Kendra のインデックスを作成する。（参考：指定したサイトから自動でデータをクローリングしてインデックスする [CloudFormation Template サンプル](docs/kendra-docs-index.yaml))

### 2. LLM を SageMaker Endpoint にデプロイ

1. SageMaker エンドポイントを作成する。（参考：Rinna を CloudShel からデプロイする[スクリプト](../llm/README.md)）

### 3. アプリのデプロイ

1. `npm install -g @aws-amplify/cli@12.1.1` で Amplify CLI のインストール
2. `amplify init` でプロジェクトを初期化
3. `cp .env.development-template .env`　で環境変数ファイルの作成
4. `amplify/backend/api/fargate/src/docker-compose.yml` と `.env` の環境変数を変更する
5. `amplify publish -y` でデプロイ

## ローカル開発

### バックエンド

1. `cd amplify/backend/api/fargate/src/langchain`
2. `docker build -t langchain:1.0 .`
3. `cp .env.development-template .env`
4. `.env` ファイルを編集
5. `docker run -p 8080:8080 --env-file=.env langchain:1.0`

### フロントエンド

1. `cp .env.development-template .env`
2. `.env` ファイルを編集
   1. `VITE_SERVER_URL=http://localhost:8080` のコメントアウトを解除
3. `npm run dev`

### 変更のデプロイ

バックエンドのみデプロイ：`amplify push -y`
全てデプロイ：`amplify publish -y`

## プロジェクト構造についての解説

```
.
|-- src                            # フロントエンド
|-- amplify
|   |-- team-provider-info.json    # Amplify の環境設定
|   |-- backend
|       |-- api/fargate            # バックエンド API
|       |-- auth                   # Cognito 設定
|       |-- hosting                # ホスティング 設定
|-- docs
|   |-- kendra-docs-index.yaml     # Kendra 構築の CloudFormation サンプル
|-- llm                            # SageMaker エンドポイントをデプロイするサンプルスクリプト
```

- フロントエンドは Amplify Hosting でデプロイされます。その際、Amplify により生成されるバックエンドの情報（ `src/aws-exports.js`）および ローカルの環境変数（`.env` ファイルの内容）を使用してビルドします。Kendra のインデックス情報は環境変数（`VITE_INDEX_ID`）で反映する必要があります。ローカルのバックエンドでテストする際には `VITE_SERVER_URL` でローカルのエンドポイントを指定することでエンドポイントを上書きすることができます。
- バックエンド API は Amplify の [Serverless Container](https://docs.amplify.aws/cli/usage/containers/) 機能を利用しています。裏側では CodePipeline + CodeBuild でイメージをビルドし、Fargate にデプロイしており、API Gateway + Service Discovery によりリクエストをルーティングしています。これらは CloduFormation nested stack から確認することが可能です。
- バックエンドの環境変数は Amplify がデプロイの際に `amplify/backend/api/fargate/src/docker-compose.yml` の内容を読み取り`amplify/backend/api/fargate/fargate-cloudformation-template.json` を書き換えコンテナの環境変数として渡しています。 

