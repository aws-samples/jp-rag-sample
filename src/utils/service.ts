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
  ListDataSourcesCommandOutput
} from "@aws-sdk/client-kendra";
import { InvokeWithResponseStreamCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

import { Dic, Filter, selectItemType } from "./interface";
import { DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER } from "./constant";
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