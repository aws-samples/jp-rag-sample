import { AttributeFilter, DescribeIndexCommand, QueryCommandOutput, SortingConfiguration } from "@aws-sdk/client-kendra";
import { indexId, serverUrl } from "../services/AWS";
import { DEFAULT_LANGUAGE, DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER, MAX_INDEX, MIN_INDEX, SORT_ATTRIBUTE_INDEX, SORT_ORDER_INDEX } from "./constant";
import { Filter, selectItemType } from "./interface";

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
    const fs: AttributeFilter[] = [];
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
            'Content-Type': 'application/json'
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

export function getFiltersFromQuery(query: QueryCommandOutput): Filter[] {
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
                        os.push({
                            name: valuePair.DocumentAttributeValue?.StringValue,
                            value: ""
                        })
                    }
                }
                fs.push({
                    filterType: "SELECT_MULTI_STRING_FROM_LIST",
                    title: fr.DocumentAttributeKey,
                    options: os,
                    selected: new Array(os.length).fill(null).map(() => true)
                })

                // DEBUG
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
                const osDate: Date[] = [];
                const osNum: number[] = [];

                for (const valuePair of fr.DocumentAttributeValueCountPairs ?? []) {
                    if (valuePair.DocumentAttributeValue?.DateValue !== undefined) {
                        osDate.push(valuePair.DocumentAttributeValue?.DateValue)
                        osNum.push(valuePair.DocumentAttributeValue?.DateValue.getTime())
                    }
                }
                const osPast: Date = osDate[osNum.indexOf(Math.min(...osNum))]
                const osRecent: Date = osDate[osNum.indexOf(Math.max(...osNum))]

                fs.push({
                    filterType: "RANGE_DATE",
                    title: fr.DocumentAttributeKey,
                    options: [
                        { "name": "past", value: osPast.toString() },
                        { "name": "recent", value: osRecent.toString() }
                    ],
                    selected: [osPast, osRecent]
                })
            }
        }
    }
    return fs
}

export async function postData(url = '', data = {}) {
    const r = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return await r.json()
}