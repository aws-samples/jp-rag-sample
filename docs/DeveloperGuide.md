# 開発者ガイド Guide

## デプロイ

> [!IMPORTANT]
> このリポジトリでは、デフォルトでバージニア北部リージョン (us-east-1) の Anthropic Claude 3 Haiku モデルを利用する設定になっています。[Model access 画面 (us-east-1)](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess)を開き、Anthropic Claude 3 Haiku にチェックして Save changes してください。

JP-RAG-Sample のデプロイには [AWS Cloud Development Kit](https://aws.amazon.com/jp/cdk/)（以降 CDK）を利用します。Step-by-Step の解説、あるいは、別のデプロイ手段を利用する場合は以下を参照してください。
- [Workshop](https://catalog.workshops.aws/generative-ai-use-cases-jp)
- [動画によるデプロイ手順の紹介](https://www.youtube.com/watch?v=9sMA17OKP1k)

まず、以下のコマンドを実行してください。全てのコマンドはリポジトリのルートで実行してください。

```bash
npm ci
```

CDK を利用したことがない場合、初回のみ [Bootstrap](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/bootstrapping.html) 作業が必要です。すでに Bootstrap された環境では以下のコマンドは不要です。

```bash
npx -w packages/cdk cdk bootstrap
```

続いて、以下のコマンドで AWS リソースをデプロイします。デプロイが完了するまで、お待ちください（20 分程度かかる場合があります）。

```bash
npm run cdk:deploy
```

## デプロイオプション

`packages/cdk/cdk.json` で設定を管理しています。

#### 既存の Kendra Index を利用する

デフォルトでは新規の Kendra Index が作成されますが、既存の Kendra Index をインポートして使用することが可能です。

```
"kendraIndexArn": "arn:aws:kendra:<region>:<account_id>:index/<index_id>",
"kendraDataSourceBucketName": null,
```

#### アクセス制限の設定

デフォルトでは公開されている URL より新規のアカウントが発行可能ですが、新規アカウント発行を無効化することが可能です。管理者のみがアカウント発行するケースなどで利用できます。

```
"selfSignUpEnabled": true,
```

また、サインアップできる E メールのドメインを制限することも可能です。自社の社員のみサインアップ可能にしたい場合などに利用できます。

```
"allowedSignUpEmailDomains": null,
```

また、SAML を使用してログインすることも可能です。

```
"samlAuthEnabled": false,
"samlCognitoDomainName": "",
"samlCognitoFederatedIdentityProviderName": "",
```

また、IP もしくは国でアクセスを制限することも可能です。

```
"allowedIpV4AddressRanges": null,
"allowedIpV6AddressRanges": null,
"allowedCountryCodes": null,
```

#### モデルの設定を変更する

デフォルトでは `us-east-1` の `anthropic.claude-3-haiku-20240307-v1:0` を使用していますが、他のリージョン・モデルに切り替えることも可能です。

```
"modelRegion": "us-east-1",
"modelIds": [
   "anthropic.claude-3-haiku-20240307-v1:0"
],
```

#### 独自ドメイン

独自ドメインを設定したい場合は以下の設定を変更してください。

```
"hostName": null,
"domainName": null,
"hostedZoneId": null,
```

## ローカル開発

### バックエンド

`packages/cdk` ディレクトリで `cdk watch` を実行すると Lambda への変更が高速で反映されます。詳細については[ドキュメント](https://cdkworkshop.com/ja/20-typescript/30-hello-cdk/300-cdk-watch.html) をご確認ください。

### フロントエンド

以下のコマンドで CloudFormation のアウトプットから必要な情報を取得しローカル環境を立ち上げます。Windows ユーザーの方も Git Bash で利用できます。

```bash
npm run web:devw
```

## プロジェクト構造についての解説

```
packages
|-- web                            # フロントエンド
|-- cdk                            # バックエンド
|-- types                          # 共通の型定義
```
