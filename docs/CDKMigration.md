# 移行ガイド v0.3.0 → v0.4.0

このソリューションは v0.4.0 より、より簡単にソリューションを拡張しお客様の RAG アプリケーションをカスタマイズできるように Amplify v1 から CDK ベースに移行しました。v0.4.0 からはいくつか新機能が加わっているため v0.4.0 に移行いただくことをお勧めします。

## v0.4.0 への移行手順

Kendra は既存のものをインポートして利用可能です。Cognito は新規作成になるため既存ユーザーの移行が必要です。必要に応じて v0.3.0 と v0.4.0 を並行稼働させることも可能です。

1. v0.4.0 以降のバージョンを取得 (`main` を `git pull`)
2. 既存の Kendra Index を使用する場合は[設定にて紐づけます](/docs/DeveloperGuide.md#既存の-kendra-index-を利用する)
3. [デプロイ手順](/docs/DeveloperGuide.md)に従ってデプロイします。

## v0.3.0 環境(旧バージョン)の削除

v0.4.0 デプロイ後、既存の v0.3.0 環境を削除したい場合は、Amplify の CloudFormation をコンソールから削除することが可能です。

## v0.3.0 を引き続き使う方へ

v0.3.0 は引き続き使用いただけます。仮に手元の環境が壊れ、既存の v0.3.0 環境を手元で構築し直す場合は以下の手順で既存設定を復元することが可能です。

1. `git checkout refs/tags/v0.3.0`
2. `amplify env import`