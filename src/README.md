# JP RAG SAMPLE (CLIENT)

## ディレクトリ構造
```zsh
/rag-kendra
|--src  # client の web application 実装があるディレクトリ
|  |--App.tsx  # メインのReactコンポーネント (TopBar, FilterBar, InteractionAreaで構成される)
|  |--README.md  # README
|  |--aws-exports.d.ts  # AWSリソース（例えば認証、API、ストレージなど）への接続情報
|  |--layout  # Reactコンポーネントの実装 (TopBar, FilterBar, InteractionArea)
|  |  |--FilterBar.tsx  # 画面左にあるフィルタ (FilterBar)
|  |  |--InteractionArea.tsx  # 画面中央の表示のエントリー (InteractionArea)
|  |  |--SpeachBalloon  # 画面中央に表示する AI, Kendra, RAG の部品群
|  |  |  |--AI.tsx  # AIモード時の吹き出し
|  |  |  |--Ballon.tsx  # 入力したクエリ文字と各吹き出しを表示するコンポーネント
|  |  |  |--Human.tsx  # 人の入力文字の吹き出し
|  |  |  |--Kendra.tsx  # Kendraの吹き出し (Kendraモード, RAGモード時の吹き出し)
|  |  |  |--components  # 吹き出しを構成する部品
|  |  |  |  |--AICore.tsx  # AIのCore部品。AIとRAGから被参照
|  |  |  |  |--HighlightedTexts.tsx  # 太文字表示をする部品
|  |  |  |  |--KendraResultDoc.tsx  # Kendra からのresponseのうち　document list を表示する部品
|  |  |  |  |--KendraResultExcerpt.tsx  # Kendra からのresponseのうち 抜粋を表示する部品
|  |  |  |  |--KendraResultFAQ.tsx  # Kendra からのresponseのうち FAQ を表示する部品
|  |  |  |  |--KendraResultFeatured.tsx  # Kendra からのresponseのうち Featured result を表示する部品
|  |  |  |  |--QuotedTexts.tsx  # 引用部分(eg.[0])をリンクにする部品
|  |  |--TOTP.tsx  # 検索バー内のMFAを表示する部品
|  |  |--TopBar.tsx  # 画面上部にある検索バー (TopBar)
|  |--main.tsx  # Reactアプリケーションのエントリーポイント
|  |--utils  # ユーティリティ
|  |  |--constant.tsx  # 定数
|  |  |--function.tsx  # server からの response を client 表示ように format を変更する関数定義
|  |  |--interface.tsx  # server からの response の型定義
|  |  |--serivce.tsx  # server との通信をする関数定義
|  |--vite-env.d.ts  # 環境変数の型定義
```

## ローカル開発
```
npm run dev
```