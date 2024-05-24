// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Conversation } from "../../utils/interface";
import { FeaturedResultsItem, QueryResultItem } from "@aws-sdk/client-kendra";
import { useEffect, useState } from "react";
import { KendraResultFeatured } from "./components/KendraResultFeatured";
import { KendraResultExcerpt } from "./components/KendraResultExcerpt";
import { KendraResultFAQ } from "./components/KendraResultFAQ";
import { KendraResultDoc } from "./components/KendraResultDoc";


const Kendra: React.FC<{ data: Conversation }> = ({ data }) => {
    // Kendraモード, RAGモード時の吹き出し


    const [featuredItems, setFeaturedItems] = useState<FeaturedResultsItem[]>([]);
    const [faqItems, setFaqItems] = useState<QueryResultItem[]>([]);
    const [excerptItems, setExcerptItems] = useState<QueryResultItem[]>([]);
    const [docItems, setDocItems] = useState<QueryResultItem[]>([]);

    useEffect(() => {
        const tmpFeaturedItems: FeaturedResultsItem[] = [];
        const tmpFaqItems: QueryResultItem[] = [];
        const tmpExcerptItems: QueryResultItem[] = [];
        const tmpDocItems: QueryResultItem[] = [];

        // Featured Itemのデータを分離
        if (data && data?.kendraResponse?.FeaturedResultsItems) {
            for (const result of data.kendraResponse.FeaturedResultsItems) {
                tmpFeaturedItems.push(result)
            }
        }


        // FAQ、抜粋した回答、ドキュメントを分離
        if (data && data?.kendraResponse?.ResultItems) {
            for (const result of data.kendraResponse.ResultItems) {
                switch (result.Type) {
                    case "ANSWER":
                        tmpExcerptItems.push(result);
                        break;
                    case "QUESTION_ANSWER":
                        tmpFaqItems.push(result);
                        break;
                    case "DOCUMENT":
                        tmpDocItems.push(result);
                        break;
                    default:
                        break;
                }
            }
        }

        setFeaturedItems(tmpFeaturedItems)
        setFaqItems(tmpFaqItems)
        setExcerptItems(tmpExcerptItems)
        setDocItems(tmpDocItems)

    }, [data]);

    return (
        <>
            {/* FeaturedResultを表示 */}
            <KendraResultFeatured queryId={data.kendraResponse?.QueryId} resultItems={featuredItems} />
            {/* FAQを表示 */}
            <KendraResultFAQ queryId={data.kendraResponse?.QueryId} resultItems={faqItems} />
            {/* 抜粋した回答を表示 */}
            <KendraResultExcerpt queryId={data.kendraResponse?.QueryId} resultItems={excerptItems} />
            {/* 文章のリストを表示 */}
            <KendraResultDoc queryId={data.kendraResponse?.QueryId} resultItems={docItems} />
        </>
    )

};
export default Kendra;