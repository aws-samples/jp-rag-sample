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
    promptVariables: Dic // テンプレートに埋め込む変数
    llmParam: Dic // LLMの設定値
}

export type ConversationType = "HUMAN" | "HUMAN_AI" | "HUMAN_KENDRA" | "HUMAN_KENDRA_AI";

export interface Conversation {
    /** やり取り */
    conversationType: ConversationType // やり取りの種類
    userInput: UserInput // ユーザー入力
    userQuery: QueryRequest | undefined // Kendraへの入力
    kendraResponse: QueryResult | undefined // Kendraからの出力
    aiResponse: AiResponse | undefined
}