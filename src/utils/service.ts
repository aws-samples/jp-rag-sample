// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import {
  AttributeFilter,
  DescribeIndexCommand,
  ListDataSourcesCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  SortingConfiguration,
  SubmitFeedbackCommand,
  ListDataSourcesCommandOutput,
  QueryResult
} from "@aws-sdk/client-kendra";
import { InvokeWithResponseStreamCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

import { AiSelectedInfo, Answer, Dic, Filter, Quote, selectItemType } from "./interface";
import { DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER, MAX_QUERY_SUGGESTIONS, TOP_QUERIES } from "./constant";
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from "../aws-exports";

const _loadingErrors = [];

if (!import.meta.env.VITE_INDEX_ID) {
  _loadingErrors.push(
    "環境変数にINDEX_IDがありません"
  );
}
if (!import.meta.env.VITE_STREAM_FUNC_NAME) {
  _loadingErrors.push(
    "環境変数にSTREAM_FUNC_ARNがありません"
  );
}
const hasErrors = _loadingErrors.length > 0;
if (hasErrors) {
  console.error(JSON.stringify(_loadingErrors));
}

export const initAWSError: string[] = _loadingErrors;

export const indexId: string = import.meta.env.VITE_INDEX_ID ?? ""
const stream_func_name: string = import.meta.env.VITE_STREAM_FUNC_NAME ?? ""
const local_server = import.meta.env.VITE_SERVER_URL ?? ""
const remote_server = awsconfig.aws_cloud_logic_custom[0].endpoint ?? ""
export const serverUrl: string = local_server ? local_server : remote_server;
let jwtToken = "";

Amplify.configure({
  ...awsconfig,
});

export function setJwtToken(token: string) {
  jwtToken = token
}

export enum Relevance {
  Relevant = "RELEVANT",
  NotRelevant = "NOT_RELEVANT",
  Click = "CLICK",
}

export async function submitFeedback(
  relevance: Relevance, // feedbackする関連度
  resultId: string, // feedbackするアイテム
  queryId: string // Query id
) {
  /**
   * 増分学習のための Feedbackを送信
   */
  const command = (relevance === Relevance.Click)
    ? new SubmitFeedbackCommand({
      IndexId: indexId,
      QueryId: queryId,
      ClickFeedbackItems: [
        {
          ResultId: resultId,
          ClickTime: new Date(),
        },
      ],
    })
    : new SubmitFeedbackCommand({
      IndexId: indexId,
      QueryId: queryId,
      RelevanceFeedbackItems: [
        {
          ResultId: resultId,
          RelevanceValue: relevance
        },
      ],
    });

  // Feedbackを送信
  const url = `${serverUrl}/v2/kendra/send`
  const r = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(command)
  })
  return await r.json()
}


export function getKendraQuery(
  /**
   * Kendra Query API への request Bodyを作成
   */
  queryText: string,
  attributeFilter: AttributeFilter,
  sortingConfiguration: SortingConfiguration | undefined
): QueryCommandInput {
  return {
    IndexId: indexId,
    PageNumber: 1,
    PageSize: 10,
    QueryText: queryText,
    AttributeFilter: attributeFilter,
    SortingConfiguration: sortingConfiguration,
  }
}


export function overwriteQuery(
  /**
   * Kendra Query API への request Bodyへフィルタリング情報を付与
   */
  prevQuery: QueryCommandInput,
  newAttributeFilter: AttributeFilter,
  newSortingConfiguration: SortingConfiguration | undefined
): QueryCommandInput {
  return {
    ...prevQuery,
    AttributeFilter: newAttributeFilter,
    SortingConfiguration: newSortingConfiguration,
  }
}


export async function kendraQuery(param: QueryCommandInput) {
  /**
   * Kendra Query API を実行
   */
  const data = await fetch(`${serverUrl}/v2/kendra/query`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(new QueryCommand(param))
  })
    .then(response => response.json())
    .then((r: QueryCommandOutput) => { return r })

  return data;
}


export async function getDatasourceInfo(): Promise<Dic> {
  /*
   * DataSource の情報を取得
   */

  const command = new ListDataSourcesCommand({
    IndexId: indexId
  });
  const url = `${serverUrl}/v2/kendra/listDataSources`

  const data = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(command)
  })
    .then(response => response.json())
    .then((r: ListDataSourcesCommandOutput) => {
      // Datasource list を {id:name} の dict に変換
      const datasourceDic: Dic = {}
      for (const datasourceItem of r.SummaryItems ?? []) {
        datasourceDic[datasourceItem.Id ?? ""] = datasourceItem.Name ?? "";
      }
      return datasourceDic
    })

  return data
}


export async function getSortOrderFromIndex(): Promise<Filter> {
  /*
   * Index から並び順の候補を取得
  */
  const sortingAttributeDateList: selectItemType[] = [
    { name: DEFAULT_SORT_ATTRIBUTE, value: DEFAULT_SORT_ATTRIBUTE }
  ];

  // indexidを使いkendraから情報を取得
  const command = new DescribeIndexCommand({
    Id: indexId
  });
  const url = `${serverUrl}/v2/kendra/describeIndex`

  const r = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(command)
  })
  await r.json().then((v) => {
    const configList = v.DocumentMetadataConfigurations
    // sortableなファセットの候補を取得
    if (configList) {
      for (const documentMetadataConfig of configList) {
        if (documentMetadataConfig
          && documentMetadataConfig.Search?.Sortable
          && documentMetadataConfig.Name) {
          sortingAttributeDateList.push({
            name: documentMetadataConfig.Name,
            value: documentMetadataConfig.Name
          });
        }
      }
    }
  })

  return {
    filterType: "SORT_BY",
    title: "並び順",
    options: sortingAttributeDateList,
    selected: [DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER]
  }

}

export async function* infStreamClaude(user_prompt: string) {
  /**
   * Claude で ストリーミング推論
   */
  // 認証情報
  const region_name = awsconfig.aws_project_region;
  const userPoolId = awsconfig.aws_user_pools_id;
  const providerName = `cognito-idp.${region_name}.amazonaws.com/${userPoolId}`;
  const lambda_client = new LambdaClient({
    region: region_name,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: region_name }),
      identityPoolId: awsconfig.aws_cognito_identity_pool_id,
      logins: {
        [providerName]: (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    })
  });

  // ペイロード
  const body = {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": user_prompt
          }
        ]
      }
    ],
    "max_tokens": 500,
    "anthropic_version": "bedrock-2023-05-31",
    "temperature": 0,
    "top_k": 1,
    "stop_sequences": [
      "Human: "
    ],
  }
  const req = {
    "body": {
      "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
      "accept": "application/json",
      "contentType": "application/json",
      "body": JSON.stringify(body)
    }
  }

  // ストリーミング推論
  const lambda_command = new InvokeWithResponseStreamCommand({
    FunctionName: stream_func_name,
    Payload: JSON.stringify(req),
  })
  const res = await lambda_client.send(lambda_command);

  // チャンクを表示
  const events = res.EventStream;
  if (!events) {
    return;
  }
  for await (const event of events) {
    if (event.PayloadChunk) {
      yield new TextDecoder('utf-8').decode(event.PayloadChunk.Payload);
    }

    if (event.InvokeComplete) {
      break;
    }
  }
}

export function kendraResultToAiSelectedInfo(searchResult: QueryResult): AiSelectedInfo[] {
  let id_num: number = 0;

  let selectedItem: AiSelectedInfo[] = [];

  // Featured Item
  for (const result of searchResult?.FeaturedResultsItems ?? []) {

    selectedItem.push({
      title: result.DocumentTitle?.Text ?? "",
      chank: result.DocumentExcerpt?.Text ?? "",
      url: result.DocumentURI ?? "",
      lastUpdate: "",
      feadbackToken: result.FeedbackToken ?? ""
    })

    id_num++;
  }
  // FAQ、抜粋した回答、ドキュメント
  for (const result of searchResult?.ResultItems ?? []) {

    selectedItem.push({
      title: result.DocumentTitle?.Text ?? "",
      chank: result.DocumentExcerpt?.Text ?? "",
      url: result.DocumentURI ?? "",
      lastUpdate: "",
      feadbackToken: result.FeedbackToken ?? ""
    })

    id_num++;
  }

  return selectedItem
}

export function createQuotePrompt(searchResult: AiSelectedInfo[], query: string): string {
  /**
   * 引用生成のためのプロンプト
   */

  let docs: string = "";

  for (let idx = 0; idx < searchResult.length; idx++) {
    docs += `<document index='${idx}'>
<title>${searchResult[idx].title}</title>
<document_content>${searchResult[idx].chank}</document_content>
</document>`
  }

  const promptTemplate = `
You are an expert research assistant. 
Here are some documents for you to reference for your task:
<documents>` + docs + `</documents>
 First, find the quotes from the document that are most relevant to answering the question, and then print them in numbered order. Quotes should be relatively short.

If there are no relevant quotes, write 'No relevant quotes' instead.

Thus, the format of your overall response should look like what's shown between the <example></example> tags. Make sure to follow the formatting and spacing exactly.
<example>
<quote>
<document_index>1</document_index>
<text>Company X reported revenue of $12 million in 2021.</text>
</quote>
<quote>
<document_index>3</document_index>
<text>Almost 90% of revenue came from widget sales, with gadget sales making up the remaining 10%.</text>
</quote>
</example>

Here is Question: <Question>${query}<Question>
If the question cannot be answered by the document, say so.
Here is the most relevant sentence in the context:
<Answer>`;

  return promptTemplate
}

export const parseAnswerFromGeneratedQuotes = (answerText: string): Answer => {
  /**
   * 生成された引用を構造化
   */
  const quotes: Quote[] = [];
  const quoteRegex = /<quote>([\s\S]*?)<\/quote>/g;
  const documentIndexRegex = /<document_index>([\s\S]*?)<\/document_index>/;
  const textRegex = /<text>([\s\S]*?)<\/text>/;

  let match;
  while ((match = quoteRegex.exec(answerText)) !== null) {
    const quoteText = match[1];
    const documentIndexMatch = documentIndexRegex.exec(quoteText);
    const textMatch = textRegex.exec(quoteText);

    if (documentIndexMatch && textMatch) {
      const documentIndex = parseInt(documentIndexMatch[1], 10);
      const text = textMatch[1];
      quotes.push({ documentIndex, text });
    }
  }

  return { quotes };
};

export function createFinalAnswerPrompt(searchResult: AiSelectedInfo[], query: string): string {
  /**
   * 回答生成のためのプロンプト
   */

  let docs: string = "";

  for (let idx = 0; idx < searchResult.length; idx++) {
    docs += `<document index='${idx}'>
<title>${searchResult[idx].title}</title>
<document_content>${searchResult[idx].chank}</document_content>
</document>`
  }

  const promptTemplate = `
あなたはプロのリサーチアシスタントです。
参照可能な最も関連性の高いドキュメントはこちらです。
<documents>` + docs + `</documents>
引用によって質問への回答してください。回答は可能な限り短くしてください。

回答全体の形式は、<example></example>タグの中に表示に従ってください。
つまり、ダブルクオーテーション (") やカッコ []、スペースを正確に再現してください。
カッコの中には<document></document> タグで定義されるindexの数字を利用します。

<example>
"Company X reported revenue of $12 million in 2021."[0]
"Almost 90% of revenue came from widget sales, with gadget sales making up the remaining 10%."[3] 
</example>

こちらが質問です: <Question>${query}<Question>
文章中に関連する文章が無い場合は、「わかりません。」と回答してください。回答する際にあなたは類推してはいけません。
では<Answer></Answer>タグで回答してください。:`;

  return promptTemplate
}

export function createNextQeuryPrompt(finalResult: string, query: string) {
  const promptTemplate = `
  検索エンジンに入力するクエリを最適化し、様々な角度から検索を行うことで、より適切で幅広い検索結果が得られるようにします。 
具体的には、類義語や日本語と英語の表記揺れを考慮し、多角的な視点からクエリを生成します。

以下の<question>タグ内にはユーザーの入力した質問文が入ります。
この質問文に基づいて、${MAX_QUERY_SUGGESTIONS}個の検索用クエリを生成してください。
各クエリは30トークン以内とし、日本語と英語を適切に混ぜて使用することで、広範囲の文書が取得できるようにしてください。

生成されたクエリは、<example></example>タグ内のフォーマットに従って出力してください。

<example>
<query>Knowledge Bases for Amazon Bedrock vector databases engine DB</query>
<query>Amazon Bedrock ナレッジベース ベクトルエンジン vector databases DB</query>
<query>Amazon Bedrock RAG 検索拡張生成 埋め込みベクトル データベース エンジン</query>
</example>

このシステムでよく検索されるクエリの一覧はこちらです。<FrequentQuery>${TOP_QUERIES}</FrequentQuery>
こちらが質問とそれに対する回答です。<Question>${query}<Question><Response>${finalResult}</Response>

ではクエリを生成してください。
`

  return promptTemplate
}

export const parseNextQueryFromSuggestion = (exampleText: string): string[] => {
  const queries: string[] = [];
  const queryRegex = /<query>([\s\S]*?)<\/query>/g;

  let match;
  while ((match = queryRegex.exec(exampleText)) !== null) {
      const queryText = match[1];
      queries.push(queryText);
  }

  return queries;
};