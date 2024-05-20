// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { QueryRequest, QueryResult } from "@aws-sdk/client-kendra";

export interface Dic {
    /** 辞書型 */
    [key: string]: string;
}

export interface UserInput {
    /** ユーザーからの入力 */
    word: string
}

export interface AiResponse {
    /** AIからの返答 */
    userUtterance: string // ユーザーからの入力
    aiUtterance: string // AIからの応答
    actualPrompt: string // AIに入力されたプロンプト
    memory: any // 入力以前のやりとり
    usedTemplatePrompt: string // 利用したテンプレート
    contexts: DocumentForInf[] // テンプレートに埋め込む変数
    llmParam: Dic // LLMの設定値
}
// やり取りの種類
export type ConversationType = "HUMAN" | "HUMAN_AI" | "HUMAN_KENDRA" | "HUMAN_KENDRA_AI";


// やり取り
export interface Conversation {
    /** やり取り */
    conversationType: ConversationType // やり取りの種類
    userInput: UserInput // ユーザー入力
    userQuery: QueryRequest | undefined // Kendraへの入力
    kendraResponse: QueryResult | undefined // Kendraからの出力
    aiResponse: AiResponse | undefined
}

// 1選択式のフィルタアイテム
export type selectItemType = {
    name: string,
    value: string
}

// フィルタの種類
export type FilterType = "LAUNGUAGE_SETTING" | "SORT_BY" | "SELECT_ONE_STRING" | "CONTAIN_STRING" | "RANGE_NUM" | "RANGE_DATE" | "SELECT_MULTI_STRING_FROM_LIST";

// フィルタ
export interface Filter {
    filterType: FilterType,
    title: string,
    options: selectItemType[],
    selected: string[] | boolean[] | number[] | Date[]
}

// LLM で推論するためのデータ型
type DocTypeForInf = "DOCUMENT" | "QUESTION_ANSWER" | "ANSWER";
export interface DocumentForInf {
    excerpt: string,
    title: string,
    content: string,
    type: DocTypeForInf
}

// AIに選択された情報
export interface AiSelectedInfo {
    title: string,
    chunk: string,
    url: string,
    lastUpdate: string,
    feadbackToken: string
}

// AI Agentのステータス
export interface AiAgentStatus {
    aiAgentResponse: string,
    aiSelectedInfoList: AiSelectedInfo[],
    suggestedQuery: string[],
    systemLog: string[],
    diveDeepIsEnabled: boolean,
    userQuery: string
}

// AI Agentの利用履歴
export interface AiAgentHistory {
    [queryId: string]: AiAgentStatus
}

export interface Quote {
    documentIndex: number;
    text: string;
}

export interface Answer {
    quotes: Quote[];
}