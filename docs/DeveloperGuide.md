# Developer Guide

## デプロイ

### 1. Kendra のインデックスを作成

1. Kendra のインデックスを作成する。（参考：指定したサイトから自動でデータをクローリングしてインデックスする [CloudFormation Template サンプル](../kendra/kendra-docs-index.yaml))

### 2. LLM を SageMaker Endpoint にデプロイ

1. SageMaker エンドポイントを作成する。（参考：Rinna を CloudShel からデプロイする[スクリプト](../llm/README.md)）

### 3. アプリのデプロイ

1. `npm install -g @aws-amplify/cli@12.1.1` で Amplify CLI のインストール
2. `amplify configure` で認証情報を設定。リージョンの設定がアプリケーションのリージョンになるため注意。
3. `npm i` でライブラリをインストール
4. `amplify init` でプロジェクトを初期化
   1. ? Do you want to use an existing environment? No
   2. ? Enter a name for the environment dev
5. バックエンドの環境変数を設定する
   1. Kendra のインデックスをシークレットに追加する：`echo -n <KENDRA_INDEX> > amplify/backend/api/fargate/secrets/.secret-kendra` 
   2. (Anthropic を使用する場合) 
      1. Anthropic の API キーをシークレットに追加する： `echo -n <ANTHROPIC_API_KEY> > amplify/backend/api/fargate/secrets/.secret-anthropic` 
      2. `amplify/backend/api/fargate/src/docker-compose.yml` のコメントを解除する。ファイルがない/空の場合はエラーになるため使わない場合はコメントアウトする。
   3. `amplify/backend/api/fargate/src/docker-compose.yml` の環境変数を必要に応じて変更する
6. フロントエンドの環境変数を設定する
   1. `cp .env.development-template .env`　でフロントエンド用の環境変数ファイルの作成
   2.  `.env` の環境変数を変更する
      1. `VITE_INDEX_ID` を Kendra の Index ID に指定する。
7.  `amplify publish` でデプロイ
    1. Are you sure you want to continue? (Y/n) · yes
    2. ? Secret configuration detected. Do you wish to store new values in the cloud? Yes  # <- 初回は Secret Manager に保存する

## ローカル開発

### バックエンド

1. `cd amplify/backend/api/fargate/src/langchain`
2. `cp .env.development-template .env`
3. `.env` ファイルを編集
4. `./build_and_run.sh`

### フロントエンド

1. `cp .env.development-template .env`
2. `.env` ファイルを編集
   1. `VITE_SERVER_URL=http://localhost:8080` のコメントアウトを解除
3. `npm run dev`

### 変更のデプロイ

1. 忘れずにフロントエンドの `.env` ファイルの `VITE_SERVER_URL` をコメントアウトする
2. デプロイ
   1. バックエンドのみデプロイ：`amplify push -y`
   2. 全てデプロイ：`amplify publish -y`

## 環境の削除

1. `amplify env remove <env>`

## プロジェクト構造についての解説

```
.
|-- docs                           # ドキュメント
|
|-- amplify
|   |-- team-provider-info.json    # Amplify の環境設定
|   |-- backend
|       |-- api/fargate            # バックエンド API
|       |   |-- src                # バックエンドのコード
|       |   |-- secrets            # シークレットを格納するファイル
|       |
|       |-- auth                   # Cognito 設定
|       |-- hosting                # ホスティング 設定
|
|-- kendra
|   |-- kendra-docs-index.yaml     # Kendra 構築の CloudFormation サンプル
|
|-- llm
|   |-- deploy_llm.sh              # SageMaker エンドポイントをデプロイするサンプルスクリプト
|   |-- delete_llm.sh              # SageMaker エンドポイントを削除するサンプルスクリプト
|
|-- amplify.yml                    # Amplify コンソールを使った CICD の際のマニフェスト
|
|-- src                            # フロントエンド
|-- *                              # フロントエンド関連 / その他
```

- フロントエンドは Amplify Hosting でデプロイされます。その際、Amplify により生成されるバックエンドの情報（ `src/aws-exports.js`）および ローカルの環境変数（`.env` ファイルの内容）を使用してビルドします。Kendra のインデックス情報は環境変数（`VITE_INDEX_ID`）で反映する必要があります。ローカルのバックエンドでテストする際には `VITE_SERVER_URL` でローカルのエンドポイントを指定することでエンドポイントを上書きすることができます。
- バックエンド API は Amplify の [Serverless Container](https://docs.amplify.aws/cli/usage/containers/) 機能を利用しています。裏側では CodePipeline + CodeBuild でイメージをビルドし、Fargate にデプロイしており、API Gateway + Service Discovery によりリクエストをルーティングしています。これらは CloduFormation nested stack から確認することが可能です。
- バックエンドの環境変数は Amplify がデプロイの際に `amplify/backend/api/fargate/src/docker-compose.yml` の内容を読み取り`amplify/backend/api/fargate/fargate-cloudformation-template.json` を書き換えコンテナの環境変数として渡しています。 

## セキュリティ

- このサンプルは MFA を登録することが可能です。
- 必要に応じて Cognito の高度なセキュリティ機能を有効化することができます
- 必要に応じて Cognito の Federated Identity Provider 機能を利用して SAML もしくは Open ID Connect 経由でのサインインを設定することができます。
- コンテナのロギング有効になっています。追加で API Gateway のロギングを有効にすることも可能です。
