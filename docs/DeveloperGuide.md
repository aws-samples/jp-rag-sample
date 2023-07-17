# Developer Guide

## デプロイ

### 1. Kendra のインデックスを作成

1. Kendra のインデックスを作成する。（参考：指定したサイトから自動でデータをクローリングしてインデックスする [CloudFormation Template サンプル](../kendra/kendra-docs-index.yaml)

### 2. LLM を SageMaker Endpoint にデプロイ

1. SageMaker エンドポイントを作成する。
   - エンドポイントの作成方法は、[スクリプト](../llm/README.md)）を参照ください。Rinna の推論エンドポイントを CloudShel からデプロイする方法が記載されています。

### 3. アプリのデプロイ

1. `npm install -g @aws-amplify/cli@12.1.1` で Amplify CLI のインストール
2. `amplify configure` で認証情報を設定。リージョンの設定がアプリケーションのリージョンになるため注意。
   1. `? region:  (Use arrow keys) ` は、最重要です。amplifyを立ち上げるリージョンを選択ください。ここで指定したリージョンを以降の設定でもご利用いただきます。
   2. `to complete the user creation in the AWS console` が表示されたら、自動で表示される以下のURLの指示に従って amplify を作成するユーザを作成ください 例: amplify-dev ユーザー
      - https://docs.amplify.aws/cli/start/install/#configure-the-amplify-cli
      - ユーザーには、`Administrator-Access-Amplify` policyを付与お願いします。
   3. `Enter the access key of the newly created user:` が表示されましたら、作成したユーザーの アクセストークン、シークレットアクセストークン を設定ください
   4. `Profile Name:  (default) ` が表示されましたら、ローカル プロファイルとして保存する名前を指定ください。default プロファイルにする場合はなにも入力せずに Enterを押してください。
   5. 以降、Amplifyを利用する場合は、本プロファイルに切り替えた上でご利用することを前提とします。
3. `npm i` でライブラリをインストール
4. `amplify init` でプロジェクトを初期化
   1. `? Do you want to use an existing environment?:` n 
   2. `? Enter a name for the environment:` mydev (好きな名前)  # <- `amplify/team-provider-info.json` に書かれている既存の環境と同じ名前は使えない。先にファイルごと削除してしまっても問題ない。
   3. `? Select the authentication method you want to use:` AWS profile
   4. `? Please choose the profile you want to use:` は `amplify configure` の時に作成したプロファイルを選択
5. バックエンドの環境変数を設定する
   1. `cp amplify/backend/api/fargate/src/docker-compose-template.yml amplify/backend/api/fargate/src/docker-compose.yml`　で docker-compose.ymlファイルを作成する。
   2. `amplify/backend/api/fargate/secrets/.secret-kendra` ファイルを作成し、Kendra の Index ID を入れる。
   3. (Anthropic を使用する場合) `amplify/backend/api/fargate/secrets/.secret-anthropic` ファイルを作成し、Anthropic の API キーを入れる。また、`amplify/backend/api/fargate/src/docker-compose.yml` のコメントを解除する。ファイルがない/空の場合はエラーになるため使わない場合はコメントアウトする。
   4. `amplify/backend/api/fargate/src/docker-compose.yml` の環境変数を必要に応じて変更する。
      - (MUST) `AWS_REGION` を amplify を立ち上げるリージョンにする。
      - (WANT) `ALLOW_ORIGINS` は Access-Control-Allow-Origin の設定値です。
      - (WANT) `SAGEMAKER_ENDPOINT_NAME` は立ち上げた SageMaker エンドポイント名です。deploy_llm.sh で立ち上げた場合、変更の必要はありません。
      - (WANT) `LLM` は、rinna か claude を指定可能。 Anthropicを利用する場合は claudeを指定する。
6. フロントエンドの環境変数を設定する
   1. `cp .env.development-template .env`　でフロントエンド用の環境変数ファイルの作成
   2.  `.env` の環境変数を変更する
      -  `VITE_INDEX_ID` を Kendra の Index ID に指定する。
7.  `amplify publish` でデプロイ
   1. `? Are you sure you want to continue? (Y/n) ` は Y と入力
      - もし `You are not authorized to perform this operation` というエラーが発生した場合、ユーザー に `AdministratorAccess` ポリシー を付与して再試行お願いします。
   2. `? Secret configuration detected. Do you wish to store new values in the cloud?` Yes  # <- 初回は Secret Manager に保存する

## ローカル開発

### バックエンド

1. `cd amplify/backend/api/fargate/src/langchain`
2. `cp .env.development-template .env`
3. `.env` ファイルを編集
      - (MUST) `AWS_REGION` は AWS のリージョンを指定ください (Kendra や SageMaker が動いている)
      - (MUST) `KENDRA_INDEX_ID` を Kendra の Index ID に指定ください
      - (MUST) `AWS_ACCESS_KEY_ID` に Amplifyを操作できるユーザ のアクセスキーを設定
      - (MUST) `AWS_SECRET_ACCESS_KEY` に に Amplifyを操作できるユーザ のシークレットアクセスキーを設定
      - (WANT) `ALLOW_ORIGINS` は Access-Control-Allow-Origin の設定値 を指定ください
      - (WANT) `SAGEMAKER_ENDPOINT_NAME` は SageMaker エンドポイント名 を指定ください。
      - (WANT) `ANTHROPIC_API_KEY` Anthropicを利用する場合のみご指定ください。
      - (WANT) `LLM` は、rinna か claude を指定可能ください。 Anthropic を利用する場合は claudeを指定ください。
4. `./build_and_run.sh`
5. `http://localhost:8080` でサーバーが起動します。

詳細は、[こちら](../amplify/backend/api/fargate/src/langchain/README.md)

### フロントエンド

1. `cp .env.development-template .env` (「3. アプリのデプロイ」で未実施の場合)
2. `.env` ファイルを編集
   - `VITE_INDEX_ID` を Kendra の Index ID に指定する。(「3. アプリのデプロイ」で未実施の場合)
   - `VITE_SERVER_URL=http://localhost:8080` のコメントアウトを解除。
3. `npm run dev`

詳細は、[こちら](../src/README.md)

### 変更のデプロイ

1. 忘れずにフロントエンドの `.env` ファイルの `VITE_SERVER_URL` をコメントアウトする
2. デプロイ
   1. バックエンドのみデプロイ：`amplify push -y`
   2. 全てデプロイ：`amplify publish -y`

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
|-- kendra
|   |-- kendra-docs-index.yaml     # Kendra 構築の CloudFormation サンプル
|-- llm                            # SageMaker エンドポイントをデプロイするサンプルスクリプト
```

- フロントエンドは Amplify Hosting でデプロイされます。その際、Amplify により生成されるバックエンドの情報（ `src/aws-exports.js`）および ローカルの環境変数（`.env` ファイルの内容）を使用してビルドします。Kendra のインデックス情報は環境変数（`VITE_INDEX_ID`）で反映する必要があります。ローカルのバックエンドでテストする際には `VITE_SERVER_URL` でローカルのエンドポイントを指定することでエンドポイントを上書きすることができます。
- バックエンド API は Amplify の [Serverless Container](https://docs.amplify.aws/cli/usage/containers/) 機能を利用しています。裏側では CodePipeline + CodeBuild でイメージをビルドし、Fargate にデプロイしており、API Gateway + Service Discovery によりリクエストをルーティングしています。これらは CloduFormation nested stack から確認することが可能です。
- バックエンドの環境変数は Amplify がデプロイの際に `amplify/backend/api/fargate/src/docker-compose.yml` の内容を読み取り`amplify/backend/api/fargate/fargate-cloudformation-template.json` を書き換えコンテナの環境変数として渡しています。 

## セキュリティ

- このサンプルは MFA を登録することが可能です。
- 必要に応じて Cognito の高度なセキュリティ機能を有効化することができます
- 必要に応じて Cognito の Federated Identity Provider 機能を利用して SAML もしくは Open ID Connect 経由でのサインインを設定することができます。
- コンテナのロギング有効になっています。追加で API Gateway のロギングを有効にすることも可能です。
