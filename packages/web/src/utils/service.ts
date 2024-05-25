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
} from '@aws-sdk/client-kendra';
import {
  InvokeWithResponseStreamCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

import { Dic, Filter, selectItemType } from './interface';
import { DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER } from './constant';
import { Amplify, Auth } from 'aws-amplify';
import axios from 'axios';
import { PredictRequest } from 'jp-rag-sample';
// import awsconfig from '../aws-exports';

const _loadingErrors = [];

// if (!import.meta.env.VITE_INDEX_ID) {
//   _loadingErrors.push('環境変数にINDEX_IDがありません');
// }
if (!import.meta.env.VITE_APP_PREDICT_STREAM_FUNCTION_ARN) {
  _loadingErrors.push(
    '環境変数に VITE_APP_PREDICT_STREAM_FUNCTION_ARN がありません'
  );
}
if (!import.meta.env.VITE_APP_MODEL_IDS) {
  _loadingErrors.push('環境変数に VITE_APP_MODEL_IDS がありません');
}
const hasErrors = _loadingErrors.length > 0;
if (hasErrors) {
  console.error(JSON.stringify(_loadingErrors));
}

export const initAWSError: string[] = _loadingErrors;

export const indexId: string = import.meta.env.VITE_APP_KENDRA_INDEX_ID ?? '';
const stream_func_name: string =
  import.meta.env.VITE_APP_PREDICT_STREAM_FUNCTION_ARN ?? '';
const remote_server = import.meta.env.VITE_APP_API_ENDPOINT ?? '';
export const serverUrl: string = remote_server;
const bedrockModelIds: string[] = JSON.parse(import.meta.env.VITE_APP_MODEL_IDS)
  .map((name: string) => name.trim())
  .filter((name: string) => name);
const model_id: string = bedrockModelIds[0];
// const bedrock_region: string = import.meta.env.VITE_BEDROCK_REGION ?? '';
// let jwtToken = '';

Amplify.configure({
  Auth: {
    userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
    identityPoolId: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
    authenticationFlowType: 'USER_SRP_AUTH',
  },
});

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT,
});

// // HTTP Request Preprocessing
api.interceptors.request.use(async (config) => {
  // If Authenticated, append ID Token to Request Header
  const user = await Auth.currentAuthenticatedUser();
  if (user) {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    config.headers['Authorization'] = token;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});

// export function setJwtToken(token: string) {
//   jwtToken = token;
// }

export enum Relevance {
  Relevant = 'RELEVANT',
  NotRelevant = 'NOT_RELEVANT',
  Click = 'CLICK',
}

export async function submitFeedback(
  relevance: Relevance, // feedbackする関連度
  resultId: string, // feedbackするアイテム
  queryId: string // Query id
) {
  /**
   * 増分学習のための Feedbackを送信
   */
  const command =
    relevance === Relevance.Click
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
              RelevanceValue: relevance,
            },
          ],
        });

  // Feedbackを送信
  const data = await api
    .post('kendra/send', command)
    .then((response) => response.data);
  return data;
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
  };
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
  };
}

export async function kendraQuery(param: QueryCommandInput) {
  /**
   * Kendra Query API を実行
   */

  const data = await api
    .post('kendra/query', new QueryCommand(param))
    .then((response) => response.data)
    .then((r: QueryCommandOutput) => {
      return r;
    });

  return data;
}

export async function getDatasourceInfo(): Promise<Dic> {
  /*
   * DataSource の情報を取得
   */
  const command = new ListDataSourcesCommand({
    IndexId: indexId,
  });

  const data = await api
    .post('kendra/listDataSources', command)
    .then((response) => response.data)
    .then((r: ListDataSourcesCommandOutput) => {
      // Datasource list を {id:name} の dict に変換
      const datasourceDic: Dic = {};
      for (const datasourceItem of r.SummaryItems ?? []) {
        datasourceDic[datasourceItem.Id ?? ''] = datasourceItem.Name ?? '';
      }
      return datasourceDic;
    });
  return data;
}

export async function getSortOrderFromIndex(): Promise<Filter> {
  /*
   * Index から並び順の候補を取得
   */
  const sortingAttributeDateList: selectItemType[] = [
    { name: DEFAULT_SORT_ATTRIBUTE, value: DEFAULT_SORT_ATTRIBUTE },
  ];

  // indexidを使いkendraから情報を取得
  const command = new DescribeIndexCommand({
    Id: indexId,
  });

  await api
    .post('kendra/describeIndex', command)
    .then((response) => response.data)
    .then((v) => {
      const configList = v.DocumentMetadataConfigurations;
      // sortableなファセットの候補を取得
      if (configList) {
        for (const documentMetadataConfig of configList) {
          if (
            documentMetadataConfig &&
            documentMetadataConfig.Search?.Sortable &&
            documentMetadataConfig.Name
          ) {
            sortingAttributeDateList.push({
              name: documentMetadataConfig.Name,
              value: documentMetadataConfig.Name,
            });
          }
        }
      }
    });

  return {
    filterType: 'SORT_BY',
    title: '並び順',
    options: sortingAttributeDateList,
    selected: [DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER],
  };
}

export async function* infStreamClaude(user_prompt: string) {
  /**
   * Claude で ストリーミング推論
   */
  // 認証情報
  const region = import.meta.env.VITE_APP_REGION;
  const userPoolId = import.meta.env.VITE_APP_USER_POOL_ID;
  const idPoolId = import.meta.env.VITE_APP_IDENTITY_POOL_ID;
  const cognito = new CognitoIdentityClient({ region });
  const providerName = `cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  const lambda_client = new LambdaClient({
    region: region,
    credentials: fromCognitoIdentityPool({
      client: cognito,
      identityPoolId: idPoolId,
      logins: {
        [providerName]: (await Auth.currentSession())
          .getIdToken()
          .getJwtToken(),
      },
    }),
  });

  const req: PredictRequest = {
    model: {
      type: 'bedrock',
      modelId: model_id,
    },
    messages: [
      {
        role: 'user',
        content: user_prompt,
      },
    ],
    id: '',
  };

  // ストリーミング推論
  const lambda_command = new InvokeWithResponseStreamCommand({
    FunctionName: stream_func_name,
    Payload: JSON.stringify(req),
  });
  const res = await lambda_client.send(lambda_command);

  // チャンクを表示
  const events = res.EventStream;
  if (!events) {
    return;
  }
  for await (const event of events) {
    if (event.PayloadChunk) {
      const result = new TextDecoder('utf-8').decode(
        event.PayloadChunk.Payload
      );
      yield result;
    }

    if (event.InvokeComplete) {
      break;
    }
  }
}

export async function infClaude(user_prompt: string): Promise<string> {
  let result = '';
  for await (const chunk of infStreamClaude(user_prompt)) {
    result += chunk;
  }
  return result;
}
