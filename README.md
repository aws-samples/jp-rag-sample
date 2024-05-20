# JP RAG SOLUTION

このソリューションは AWS 上で検索用途の Retrieval Augmented Generation (RAG) を構築するサンプルコードです。

![](docs/png/rag-screenshot.png)

Retrieval Augmented Generation(RAG)とは、生成系の言語 AI モデルに外部メモリをつけるというコンセプトを指します。これまで大規模な事前トレーニング済み言語モデル (LLM) は、事前学習済みのデータを元に確からしい情報を作文できることが分かっています。ただし、知識を問うようなタスクの場合、事実でない事柄を出力するリスクを伴います。さらに、情報の出典や更新を LLM 単体で行うことは依然として未解決の研究課題です。そこで情報を LLM の学習データではなく、外部に保存し出力時に Prompt に埋め込む方式が提唱され RAG と名付けられました。このサンプルではユーザーのリクエストに最も関連する情報を企業のナレッジベースから取得し、LLM に集約させ作文する RAG ソリューションを実現します。

## Architecture Overview / 全体の構成図

このソリューションは以下のような構成になっています。

![](docs/png/rag-architecture.png)


## Point / 特徴

### ハルシネーション (誤った発言) が抑えられる

生成系 AI を単体で使う場合、ハルシネーション (誤った発言)が発生するケースが度々あります。一方で本ソリューションは、コンテンツ検索結果のドキュメントの範囲に回答を限定することでモデルのハルシネーション (誤った発言) を軽減することができます。

### フルマネージドな Retriver

本ソリュリューションの１つめの特徴としては、Retriver 部分に Amazon Kendra を利用している点が挙げられます。Amazon Kendra は完全マネージド型の AI サービスです。事前学習済みの AI モデルが組み込まれているので、関連度の高いドキュメントを取り出せます。

これまでは検索アプリケーションを運用する場合、データを取り込むコネクターの開発、全文データベースの運用、ベクトル生成用のアルゴリズム開発などが必要でした。一方 Amazon Kendra はフルマネージドサービスであるためそれらの開発・運用は不要です。Amazon Kendra には、Amazon Simple Storage Service (Amazon S3)、SharePoint、Confluence、ウェブサイトなどの一般的なデータソースへのコネクタがあらかじめ組み込まれており、HTML、Word、PowerPoint、PDF、Excel、テキストファイルなどの一般的なドキュメント形式もサポートしています。エンドユーザーの権限で許可されているドキュメントのみに基づいて応答をフィルタリングするために、アクセス制御リスト (ACL) にも対応しており、エンタープライズ企業での導入実績もあります。

### LLM は Anthropic Claude3 haiku on Amazon Bedrock を利用

本ソリューションは日本語を利用するお客様を想定し、Anthropic Claude3 haiku の利用を前提としています。Claude 3 Haiku 基盤モデルは、Claude 3 ファミリーの中で最速かつ最もコンパクトなモデルであり、ほぼ瞬時の応答性と、人間の対話を模倣したシームレスな生成人工知能 (AI) エクスペリエンスを実現するように設計されています。

### その他の特徴

#### (1) Filterを設定して再検索が可能

Amazon Kendra でのドキュメント検索のフィルター条件を指定することが可能です。
画面の左サイドバーにフィルター条件が並んでいます。

<!-- ![](docs/png/feature1.png) -->

#### (2) Incremental Learning(英語)

2023/07/19 時点で英語のドキュメントに限定されますが、増分学習が可能です。検索結果の各ドキュメントの左下に表示される Goodボタン、Badボタン を押すことで、次回以降の検索結果に反映されます。


## Search Flow / 検索の流れ

検索の流れは以下のとおりです。

![](docs/png/search-flow.png)

## デプロイ/開発

[開発者ガイド](./docs/DeveloperGuide.md) をご参照ください。

## コスト

|               リソース             | 1月あたりのコスト ($USD) |
| --------------------------------- | ---------------------:|
| Kendra Index                      |  810   |
| Fargate (0.5 vCPU, 1 GB Memory)   |  18    |
| Amplify                           |  5     |
| 合計                               |  833  |  

* 価格は 開発時点での内容になります。最新情報は AWS 公式ウェブサイト（https://aws.amazon.com/ ）にてご確認ください。

## LICENSE

Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the MIT-0 License (https://github.com/aws/mit-0)
