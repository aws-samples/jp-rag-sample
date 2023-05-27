import { DocumentAttributeValueCountPair, QueryResult } from "@aws-sdk/client-kendra";

interface AvailableFacetRetriever {
    get(attributeName: string): DocumentAttributeValueCountPair[];
    getAvailableAttributeNames(): string[];
}

type DocumentAttributeValueCountPairMap = {
    [attributeName: string]: DocumentAttributeValueCountPair[];
};

/*
 * FacetManager
 * 
 * フィルターが可能な属性を管理
*/
export class FacetManager implements AvailableFacetRetriever {
    private constructor(private map: DocumentAttributeValueCountPairMap) { }

    //   空にする
    static empty() {
        return new FacetManager({});
    }

    // QueryResult から得たデータを使い DocumentAttributeValueCountPairMap を保持する FacetManager を作成
    static fromQueryResult(response: QueryResult): FacetManager {
        const map = response.FacetResults?.reduce((map, facetResult) => {
            const key = facetResult.DocumentAttributeKey;
            const value = facetResult.DocumentAttributeValueCountPairs;

            if (key && value) {
                map[key] = value;
            }

            return map;
        }, {} as DocumentAttributeValueCountPairMap);

        if (map) {
            return new FacetManager(map);
        } else {
            return FacetManager.empty();
        }
    }

    // 属性値の setter
    set(
        attributeName: string,
        values: DocumentAttributeValueCountPair[]
    ): FacetManager {
        return new FacetManager({
            ...this.map,
            [attributeName]: values,
        });
    }

    // 属性値の getter
    get(attributeName: string): DocumentAttributeValueCountPair[] {
        if (this.map.hasOwnProperty(attributeName)) {
            return this.map[attributeName];
        } else {
            return [];
        }
    }

    // すべての属性名を取得 (Get all the available attribute names in natural sort order)
    getAvailableAttributeNames(): string[] {
        return Object.keys(this.map).sort();
    }
}