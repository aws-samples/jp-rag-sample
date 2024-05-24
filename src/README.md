# JP RAG SAMPLE (CLIENT)

![](/docs/png/layout.png)

## ディレクトリ構造
```zsh
/rag-kendra/src/
├── App.tsx  # メインのReactコンポーネント (TopBar, FilterBarなど)
├── README.md  # README
├── aws-exports.d.ts  # AWSリソース（例えば認証、API、ストレージなど）への接続情報
├── i18n  # 多言語対応用リソース
│   ├── configs.ts
│   ├── en.json
│   └── ja.json
├── layout  # レイアウト
│   ├── AiArea.tsx  # AI エージェントエリア
│   ├── FilterArea.tsx  # フィルタエリア
│   ├── InputWithSuggest.tsx  # 検索バー
│   ├── KendraAreaAssets
│   │   ├── KendraAreaMain.tsx  # 検索結果エリア
│   │   └── components
│   │       ├── HighlightedTexts.tsx  # 太文字化
│   │       ├── KendraResultDoc.tsx  # 一般の文章
│   │       ├── KendraResultExcerpt.tsx  # 抜粋された文章
│   │       ├── KendraResultFAQ.tsx  # FAQ
│   │       └── KendraResultFeatured.tsx  # 管理者にハイライトされた文章
│   ├── MainArea.tsx  # 画面中央
│   ├── TOTP.tsx  # 認証系
│   └── TopBar.tsx  # 画面上部
├── main.tsx  # Reactアプリケーションのエントリーポイント
├── utils  # ユーティリティ
│   ├── constant.tsx  # 定数
│   ├── function.tsx  # server からのレスポンス整形など
│   ├── interface.tsx  # 型定義
│   ├── service.ts  # server との通信
│   └── top_queries.json  # 上位クエリ
└── vite-env.d.ts # 環境変数の型定義
```

## ローカル開発

環境設定について
1. 前提、node v16.16 以上の環境を準備お願いします。
2. `npm install` で依存パッケージ(package.json) のインストールお願いします。
3. `cp .env.development-template .env` (「3. アプリのデプロイ」で未実施の場合)
4. `.env` ファイルを編集
   - `VITE_INDEX_ID` を Kendra の Index ID に指定する。(「3. アプリのデプロイ」で未実施の場合)
   - `VITE_SERVER_URL=http://localhost:8080` のコメントアウトを解除。

プログラム実行
1. `npm run dev`


## ローカル開発（VSCODE)

`npm run dev` を実行していることが前提となりますが、以下の `.vscode/launch.json` を作成して「Launch Chrome For Debug」を実行すると、
Chrome起動後、コードのステップ実行が可能となります。

.vscode/launch.json
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome For Debug",
            "type": "pwa-chrome",
            "request": "launch",
            "url": "http://localhost:5173",
            "webRoot": "${workspaceFolder}",
            "sourceMaps": true,
            "sourceMapPathOverrides": {
                "webpack:///./*": "${webRoot}/src/*"
            }
        }
    ]
}
```
