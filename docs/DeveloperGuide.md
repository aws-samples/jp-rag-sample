# 開発者ガイド (Developer Guide)

## デプロイ

> [!IMPORTANT]
> このリポジトリでは、デフォルトでバージニア北部リージョン (us-east-1) の Anthropic Claude 3 Haiku モデルを利用する設定になっています。[Model access 画面 (us-east-1)](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess)を開き、Anthropic Claude 3 Haiku にチェックして Save changes してください。

JP-RAG-Sample のデプロイには [AWS Cloud Development Kit](https://aws.amazon.com/jp/cdk/)（以降 CDK）を利用します。CDK がインストールされていない方は事前に [CDK をインストール](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) してください。

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

[packages/cdk/cdk.json](/packages/cdk/cdk.json) で設定を管理しており、以下のような設定が可能です。

#### 既存の Kendra Index を利用する

デフォルトでは新規の Kendra Index が作成されますが、既存の Kendra Index をインポートして使用することが可能です。

context の `kendraIndexArn` に Index の ARN を指定します。もし、既存の Kendra Index で S3 データソースを利用している場合は、`kendraDataSourceBucketName` にバケット名を指定します。


```
"kendraIndexArn": "arn:aws:kendra:<region>:<account_id>:index/<index_id>",
"kendraDataSourceBucketName": "<Kendra S3 Data Source Bucket Name>",
```

#### アクセス制限の設定

デフォルトでは公開されている URL より新規のアカウントが発行可能ですが、新規アカウント発行を無効化することが可能です。管理者のみがアカウント発行するケースなどで利用できます。

```
"selfSignUpEnabled": false,
```

また、サインアップできる E メールのドメインを制限することも可能です。自社の社員のみサインアップ可能にしたい場合などに利用できます。

```
"allowedSignUpEmailDomains": ["xxx.co.jp"],
```

また、Google Workspace や Microsoft Entra ID (旧 Azure Active Directory) などの IdP が提供する SAML 認証機能と連携ができます。次に詳細な連携手順があります。こちらもご活用ください。

- [Google Workspace と SAML 連携](https://github.com/aws-samples/generative-ai-use-cases-jp/blob/898ea5edb3bb6327a897a752747dbef3124010dc/docs/SAML_WITH_GOOGLE_WORKSPACE.md)
- [Microsoft Entra ID と SAML 連携](https://github.com/aws-samples/generative-ai-use-cases-jp/blob/898ea5edb3bb6327a897a752747dbef3124010dc/docs/SAML_WITH_ENTRA_ID.md)

[packages/cdk/cdk.json](/packages/cdk/cdk.json)　にて以下を編集してください。

- samlAuthEnabled : `true` にすることで、SAML 専用の認証画面に切り替わります。Cognito user pools を利用した従来の認証機能は利用できなくなります。
- samlCognitoDomainName : Cognito の App integration で設定する Cognito Domain 名を指定します。
- samlCognitoFederatedIdentityProviderName : Cognito の Sign-in experience で設定する Identity Provider の名前を指定します。

```
"samlAuthEnabled": true,
"samlCognitoDomainName": "your-preferred-name.auth.ap-northeast-1.amazoncognito.com",
"samlCognitoFederatedIdentityProviderName": "EntraID",
```

Web アプリへのアクセスを IP で制限したい場合、AWS WAF による IP 制限を有効化することができます。[packages/cdk/cdk.json](/packages/cdk/cdk.json) の `allowedIpV4AddressRanges` では許可する IPv4 の CIDR を配列で指定することができ、`allowedIpV6AddressRanges` では許可する IPv6 の CIDR を配列で指定することができます。

```
"allowedIpV4AddressRanges": ["192.0.2.44/32"],
"allowedIpV6AddressRanges": ["0:0:0:0:0:ffff:c000:22c/128"],
```

Web アプリへのアクセスをアクセス元の国で制限したい場合、AWS WAF による地理的制限を有効化することができます。[packages/cdk/cdk.json](/packages/cdk/cdk.json) の `allowedCountryCodes` で許可する国を Country Code の配列で指定することができます。
指定する国の Country Code は[ISO 3166-2 from wikipedia](https://en.wikipedia.org/wiki/ISO_3166-2)をご参照ください。

```
"allowedCountryCodes": ["JP"],
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

Web サイトの URL としてカスタムドメインを使用することができます。同一 AWS アカウントの Route53 にパブリックホストゾーンが作成済みであることが必要です。パブリックホストゾーンについてはこちらをご参照ください: [パブリックホストゾーンの使用 - Amazon Route 53](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/AboutHZWorkingWith.html)

同一 AWS アカウントにパブリックホストゾーンを持っていない場合は、AWS ACM による SSL 証明書の検証時に手動で DNS レコードを追加する方法や、Eメール検証を行う方法もあります。これらの方法を利用する場合は、CDK のドキュメントを参照してカスタマイズしてください: [aws-cdk-lib.aws_certificatemanager module · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_certificatemanager-readme.html)

cdk.json には以下の値を設定します。

- `hostName` ... Web サイトのホスト名です。A レコードは CDK によって作成されます。事前に作成する必要はありません
- `domainName` ... 事前に作成したパブリックホストゾーンのドメイン名です
- `hostedZoneId` ... 事前に作成したパブリックホストゾーンのIDです

```
"hostName": "genai",
"domainName": "example.com",
"hostedZoneId": "XXXXXXXXXXXXXXXXXXXX",
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
