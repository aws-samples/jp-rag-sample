// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { SortingConfiguration, AttributeFilter, QueryCommandOutput, AdditionalResultAttribute, TextWithHighlights, QueryResult } from "@aws-sdk/client-kendra";
import { DEFAULT_SORT_ATTRIBUTE, SORT_ATTRIBUTE_INDEX, SORT_ORDER_INDEX, DEFAULT_LANGUAGE, MAX_INDEX, MIN_INDEX, MAX_QUERY_SUGGESTIONS, TOP_QUERIES } from "./constant";
import { Dic, Filter, selectItemType, AiSelectedInfo, Answer, Quote } from "./interface";

export function isArrayBoolean(arr: any[]): arr is boolean[] {
    return arr.every((item) => typeof item === 'boolean');
}

export function isArrayString(arr: any[]): arr is string[] {
    return arr.every((item) => typeof item === 'string');
}

export function isArrayNumber(arr: any[]): arr is number[] {
    return arr.every((item) => typeof item === 'number');
}

export function isArrayDate(arr: any[]): arr is Date[] {
    return arr.every((item) => item instanceof Date);
}

export function getCurrentSortOrder(filterOptions: Filter[]): SortingConfiguration | undefined {
    /*
     * Query用にSortingConfigurationを抽出する
    */
    for (const filterOption of filterOptions) {
        if (filterOption.filterType === "SORT_BY" && isArrayString(filterOption.selected)) {
            // 関連度 (Default) の場合は何もしない
            if (filterOption.selected[SORT_ATTRIBUTE_INDEX] === DEFAULT_SORT_ATTRIBUTE) {
                return undefined
            }
            return {
                DocumentAttributeKey: filterOption.selected[SORT_ATTRIBUTE_INDEX],
                SortOrder: filterOption.selected[SORT_ORDER_INDEX]
            }
        }
    }
    return undefined
}

export function getAttributeFilter(filterOptions: Filter[]): AttributeFilter {
    /*
     * Query用に現在のフィルタ設定を抽出する
    */
    let fs: AttributeFilter[] = [];
    for (const filterOption of filterOptions) {
        // 言語設定
        if (filterOption.filterType === "LAUNGUAGE_SETTING" && isArrayString(filterOption.selected)) {
            fs.push({
                EqualsTo: {
                    Key: "_language_code",
                    Value: {
                        StringValue: filterOption.selected[0] ?? DEFAULT_LANGUAGE
                    }
                }
            })
        } else if (filterOption.filterType === "SELECT_MULTI_STRING_FROM_LIST" && isArrayBoolean(filterOption.selected)) {
            /*
             * 文字列複数選択式
             */

            // すべての候補が含まれている場合は何もしない
            if (!filterOption.selected.every((item) => item === true)) {
                const sv = []
                for (let si = 0; si < filterOption.selected.length; si++) {
                    if (filterOption.selected[si]) {
                        sv.push(filterOption.options[si].name)
                    }
                }
                fs.push({
                    ContainsAny: {
                        Key: filterOption.title,
                        Value: {
                            StringListValue: sv
                        }
                    }
                })
            }
        } else if (filterOption.filterType === "CONTAIN_STRING" && isArrayString(filterOption.selected)) {
            /*
             * 文字列自由記述式
             */

            // なにか書かれているときのみ
            if (filterOption.selected.length !== 0) {
                fs.push({
                    ContainsAny: {
                        Key: filterOption.title,
                        Value: {
                            StringListValue: filterOption.selected
                        }
                    }
                })
            }
        } else if (filterOption.filterType === "RANGE_NUM" && isArrayNumber(filterOption.selected)) {
            /*
             * 数値範囲
             */

            // 変更されたときのみ
            if (filterOption.selected[MIN_INDEX].toString() !== filterOption.options[MIN_INDEX].value
                || filterOption.selected[MAX_INDEX].toString() !== filterOption.options[MAX_INDEX].value) {
                fs.push({
                    AndAllFilters: [
                        {
                            GreaterThanOrEquals: {
                                Key: filterOption.title,
                                Value: {
                                    LongValue: filterOption.selected[0] ?? 0
                                }
                            }
                        },
                        {
                            LessThanOrEquals: {
                                Key: filterOption.title,
                                Value: {
                                    LongValue: filterOption.selected[1] ?? 0
                                }
                            }
                        }
                    ]
                })
            }


        } else if (filterOption.filterType === "RANGE_DATE" && isArrayDate(filterOption.selected)) {
            /*
             * 特定の時間空間にある
             */
            // デフォルト値以外の場合
            if (filterOption.selected[MIN_INDEX].toString() !== filterOption.options[MIN_INDEX].value
                || filterOption.selected[MAX_INDEX].toString() !== filterOption.options[MAX_INDEX].value) {
                fs.push({
                    AndAllFilters: [
                        {
                            GreaterThanOrEquals: {
                                Key: filterOption.title,
                                Value: {
                                    DateValue: filterOption.selected[0] ?? new Date()
                                }
                            }
                        },
                        {
                            LessThanOrEquals: {
                                Key: filterOption.title,
                                Value: {
                                    DateValue: filterOption.selected[1] ?? new Date()
                                }
                            }
                        }
                    ]
                })
            }

        }
    }
    return {
        AndAllFilters: fs
    }
}

export function getFiltersFromQuery(query: QueryCommandOutput, datasourceInfo: Dic): Filter[] {
    /*
     * Query結果からフィルタ可能なファセットを取得
     */
    const fs: Filter[] = []
    for (const fr of query.FacetResults ?? []) {
        if (fr.DocumentAttributeKey !== undefined) {
            if (fr.DocumentAttributeValueType === "STRING_VALUE") {
                // STRING_VALUE 型のファセットがあればチェックボックスで選択可能に
                const os: selectItemType[] = []
                for (const valuePair of fr.DocumentAttributeValueCountPairs ?? []) {
                    if (valuePair.DocumentAttributeValue?.StringValue !== undefined) {

                        // Datasource であれば、Datasource id から Datasource name に変換
                        if (valuePair.DocumentAttributeValue.StringValue in datasourceInfo) {
                            os.push({
                                name: datasourceInfo[valuePair.DocumentAttributeValue?.StringValue],
                                value: ""
                            })
                        } else {
                            os.push({
                                name: valuePair.DocumentAttributeValue?.StringValue,
                                value: ""
                            })
                        }
                    }
                }
                fs.push({
                    filterType: "SELECT_MULTI_STRING_FROM_LIST",
                    title: fr.DocumentAttributeKey,
                    options: os,
                    selected: new Array(os.length).fill(null).map(() => true)
                })

            } else if (fr.DocumentAttributeValueType === "STRING_LIST_VALUE") {
                // STRING_LIST_VALUE 型のファセットがあれば自由記述で選択可能に
                fs.push({
                    filterType: "CONTAIN_STRING",
                    title: fr.DocumentAttributeKey,
                    options: [],
                    selected: []
                })
            } else if (fr.DocumentAttributeValueType === "LONG_VALUE") {
                // LONG_VALUE 型のファセットがあれば数値空間を指定するフィルタを作成
                const os: number[] = [];
                for (const valuePair of fr.DocumentAttributeValueCountPairs ?? []) {
                    if (valuePair.DocumentAttributeValue?.LongValue !== undefined) {
                        os.push(valuePair.DocumentAttributeValue?.LongValue ?? 0)
                    }
                }
                const osMin: number = Math.min(...os)
                const osMax: number = Math.max(...os)

                fs.push({
                    filterType: "RANGE_NUM",
                    title: fr.DocumentAttributeKey,
                    options: [
                        { "name": "min", value: osMin.toString() },
                        { "name": "max", value: osMax.toString() },
                    ],
                    selected: [osMin, osMax]
                })
            } else if (fr.DocumentAttributeValueType === "DATE_VALUE") {
                // DATE_VALUE 型のファセットがあれば時間範囲を指定するフィルタを作成

                // 時間候補の array を作成
                const osDate: Date[] = [];
                for (const valuePair of fr.DocumentAttributeValueCountPairs ?? []) {
                    if (valuePair.DocumentAttributeValue?.DateValue !== undefined) {
                        osDate.push(new Date(valuePair.DocumentAttributeValue.DateValue))
                    }
                }

                const oldestTime: Date = new Date(Math.min(...osDate.map(date => date.getTime())));  // 最も古い時間
                const newestTime: Date = new Date(Math.max(...osDate.map(date => date.getTime())));  // 最も新しい時間

                fs.push({
                    filterType: "RANGE_DATE",
                    title: fr.DocumentAttributeKey,
                    options: [
                        { "name": "past", value: oldestTime.toString() },
                        { "name": "recent", value: newestTime.toString() }
                    ],
                    selected: [oldestTime, newestTime]
                })
            }
        }
    }
    return fs
}


export function getFAQWithHighlight(AdditionalAttributes: AdditionalResultAttribute[], targetName: string): TextWithHighlights | undefined {
    // FAQからQuestion もしくは Answerを取り出す


    for (let i = 0; i < AdditionalAttributes.length; i++) {
        if (AdditionalAttributes[i].Key === targetName) {
            return AdditionalAttributes[i].Value?.TextWithHighlightsValue
        }
    }
    return { Highlights: [], Text: "該当なし" }
}


export function getNounAnswerFromExcerpt(textWithHighlights: TextWithHighlights | undefined): string {
    // AnswerText から 名詞を取り出す

    if (textWithHighlights?.Highlights?.length === 1) {
        const highlight = textWithHighlights.Highlights[0];
        const begin = highlight.BeginOffset ?? 0;
        const end = highlight.EndOffset ?? textWithHighlights.Text?.length ?? 0;

        return textWithHighlights.Text?.substring(begin, end) ?? "";
    }
    return "";
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