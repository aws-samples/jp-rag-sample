// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { selectItemType } from './interface';

// language setting
export const LANGUAGES: selectItemType[] = [
  { name: 'English', value: 'en' },
  { name: 'Spanish', value: 'es' },
  { name: 'French', value: 'fr' },
  { name: 'German', value: 'de' },
  { name: 'Portuguese', value: 'pt' },
  { name: 'Japanese', value: 'ja' },
  { name: 'Korean', value: 'ko' },
  { name: 'Chinese', value: 'zh' },
  { name: 'Italian', value: 'it' },
  { name: 'Hindi', value: 'hi' },
  { name: 'Arabic', value: 'ar' },
  { name: 'Armenian', value: 'hy' },
  { name: 'Basque', value: 'eu' },
  { name: 'Bengali', value: 'bn' },
  { name: 'Brazilian', value: 'pt-BR' },
  { name: 'Bulgarian', value: 'bg' },
  { name: 'Catalan', value: 'ca' },
  { name: 'Czech', value: 'cs' },
  { name: 'Danish', value: 'da' },
  { name: 'Dutch', value: 'nl' },
  { name: 'Finnish', value: 'fi' },
  { name: 'Galician', value: 'gl' },
  { name: 'Greek', value: 'el' },
  { name: 'Hungarian', value: 'hu' },
  { name: 'Indonesian', value: 'id' },
  { name: 'Irish', value: 'ga' },
  { name: 'Latvian', value: 'lv' },
  { name: 'Lithuanian', value: 'lt' },
  { name: 'Norwegian', value: 'no' },
  { name: 'Persian', value: 'fa' },
  { name: 'Romanian', value: 'ro' },
  { name: 'Russian', value: 'ru' },
  { name: 'Sorani', value: 'ckb' },
  { name: 'Swedish', value: 'sv' },
  { name: 'Turkish', value: 'tr' },
];

export const DEFAULT_LANGUAGE: string = 'ja';

export const DEFAULT_SORT_ATTRIBUTE = 'Relevance';

export enum SortOrderEnum {
  Desc = 'DESC',
  Asc = 'ASC',
}

export const SEARCH_MODE_LIST = ['#rag', '#kendra', '#ai'];
export const DEFAULT_SEARCH_MODE = '#rag';

export const DEFAULT_SORT_ORDER = SortOrderEnum.Desc;

export const LANGUAGE_INDEX = 0;
export const SORT_ATTRIBUTE_INDEX = 0;
export const SORT_ORDER_INDEX = 1;
export const SORT_ORDER = ['ASC', 'DESC'];
export const MIN_INDEX = 0;
export const MAX_INDEX = 1;
export const RECENT_QUERY_CAPACITY = 3;
export const MAX_QUERY_SUGGESTION = 3;

// `aws kendra get-snapshots --index-id <indexid> --interval THIS_WEEK  --metric-type QUERIES_BY_COUNT` の結果を模したトップクエリのモックデータを読み込む
import topQueriesData from './top_queries.json';

// CTR をベースに降順でソートし クエリだけを取り出して string[] 型に変換
const sortedData = topQueriesData.SnapshotsData.sort(
  (a: (string | number)[], b: (string | number)[]) =>
    (b[2] as number) - (a[2] as number)
);
export const TOP_QUERIES: string[] = sortedData.map(
  (data: (string | number)[]) => data[0].toString()
);

// 生成AIで生み出すクエリ候補の数
export const MAX_QUERY_SUGGESTIONS = 3;
