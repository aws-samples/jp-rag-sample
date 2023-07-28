// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import { AttributeFilter, DescribeIndexCommand, QueryCommand, QueryCommandInput, QueryCommandOutput, SortingConfiguration, SubmitFeedbackCommand } from "@aws-sdk/client-kendra";
import { DataForInf, Filter, selectItemType } from "./interface";
import { DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER } from "./constant";
import { Amplify } from 'aws-amplify';
import awsconfig from "../aws-exports";

const _loadingErrors = [];

if (!import.meta.env.VITE_INDEX_ID) {
  _loadingErrors.push(
    "環境変数にINDEX_IDがありません"
  );
}
const hasErrors = _loadingErrors.length > 0;
if (hasErrors) {
  console.error(JSON.stringify(_loadingErrors));
}

export const initAWSError: string[] = _loadingErrors;

export const indexId: string = import.meta.env.VITE_INDEX_ID ?? ""
const local_server = import.meta.env.VITE_SERVER_URL ?? ""
const remote_server = awsconfig.aws_cloud_logic_custom[0].endpoint ?? ""
export const serverUrl: string = local_server ? local_server : remote_server;
let jwtToken = ""

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


export async function inference(data: DataForInf) {
  /**
   * LLM で推論し作文
   */
  const r = await fetch(`${serverUrl}/v2/llm-with-doc`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(data)
  })
  let respondedText: string = await r.json()

  // ノイズを除去
  const last_id = respondedText.lastIndexOf('。');
  if (last_id !== 0) {
    respondedText = respondedText.substring(0, last_id + 1);
  }
  return respondedText
}