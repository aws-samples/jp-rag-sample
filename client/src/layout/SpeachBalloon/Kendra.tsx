import { Box, HStack, Heading, VStack } from "@chakra-ui/layout"
import { Avatar } from "@chakra-ui/avatar"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import { IconButton } from "@chakra-ui/button";
import { Conversation } from "../../utils/interface";
import AICore from "./components/AICore";
import { AiOutlineDislike, AiOutlineFileSearch, AiOutlineLike, AiOutlinePushpin } from "react-icons/Ai";
import HighlightedTexts from "./components/HighlightedTexts";
import { FeaturedResultsItem, QueryResultItem, AdditionalResultAttribute, TextWithHighlights } from "@aws-sdk/client-kendra";
import { Relevance, s3Client, submitFeedback } from "../../services/AWS";
import Human from "./Human";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { useEffect, useState } from "react";

// FeaturedResultを表示する
export const KendraResultFeatured: React.FC<{
    queryId: string | undefined,
    resultItems: FeaturedResultsItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box>
                    <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                        {true
                            ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} onClick={() => console.log()} />
                            : <Avatar bg='green.500' icon={<AiOutlinePushpin fontSize='1.5rem' />} onClick={() => console.log()} />
                        }

                        <VStack align="start" w="85vw">
                            <Tabs variant={"enclosed"} colorScheme='green'>
                                <TabList>
                                    {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                                        <Tab key={idx}>
                                            Featured {idx}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                                        <TabPanel key={idx}>
                                            <Heading size="sm">
                                                <a href={resultItem.DocumentURI} onClick={() => {
                                                    submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                }}>
                                                    <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                </a>
                                            </Heading>
                                            <Box>
                                                <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            </Box>
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        </VStack>
                    </HStack>
                </Box>
            )
        } else {
            return (<></>)
        }
    }

// 抜粋した回答を返す
export const KendraResultExcerpt: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]
}> = ({ queryId, resultItems }) => {
    if (queryId !== undefined && resultItems.length > 0) {
        function getAnswer(textWithHighlights: AdditionalResultAttribute[]): string {
            const MAX_TOP_ANSWER_LENGTH = 25;

            for (const textWithHighlight of textWithHighlights) {
                if (
                    textWithHighlight &&
                    textWithHighlight.Value?.TextWithHighlightsValue?.Highlights &&
                    textWithHighlight.Value?.TextWithHighlightsValue?.Text
                ) {
                    for (const highlight of textWithHighlight.Value.TextWithHighlightsValue.Highlights) {
                        const begin = highlight.BeginOffset ?? 0;
                        const end = highlight.EndOffset ?? textWithHighlight.Value.TextWithHighlightsValue.Text.length ?? 0;

                        const length = end - begin;
                        if (
                            highlight &&
                            highlight.TopAnswer &&
                            length < MAX_TOP_ANSWER_LENGTH
                        ) {
                            return textWithHighlight.Value.TextWithHighlightsValue.Text.substring(begin, end);
                        }
                    }
                }
            }
            return "";
        }

        return (
            <Box>
                <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                    {true
                        ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} onClick={() => console.log()} />
                        : <Avatar bg='green.500' icon={<AiOutlinePushpin fontSize='1.5rem' />} onClick={() => console.log()} />
                    }

                    <VStack align="start" w="85vw">
                        <Tabs variant={"enclosed"} colorScheme='green'>
                            <TabList>
                                {resultItems.map((resultItem: QueryResultItem, idx: number) => (
                                    <Tab key={idx}>
                                        抜粋 {idx}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                    <TabPanel key={idx}>
                                        <HStack>
                                            <VStack mt="5">
                                                <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                    submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                                <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                    submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                            </VStack>

                                            <VStack align={"left"}>
                                                <Heading size="sm">
                                                    <a href={resultItem.DocumentURI} onClick={() => {
                                                        submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                    }}>
                                                        <strong>
                                                            {
                                                                getAnswer(resultItem.AdditionalAttributes ?? [])
                                                            }
                                                        </strong>
                                                    </a>
                                                </Heading>
                                                <Box>
                                                    <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                </Box>
                                            </VStack>
                                        </HStack>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </HStack>
            </Box>
        )
    } else {
        return (<></>)
    }
}

// FAQからQuestion もしくは Answerを取り出す
function getFAQWithHighlight(AdditionalAttributes: AdditionalResultAttribute[], targetName: string): TextWithHighlights | undefined {
    for (let i = 0; i < AdditionalAttributes.length; i++) {
        if (AdditionalAttributes[i].Key === targetName) {
            return AdditionalAttributes[i].Value?.TextWithHighlightsValue
        }
    }
    return { Highlights: [], Text: "該当なし" }
}

// FAQ を表示
export const KendraResultFAQ: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box>
                    <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                        {true
                            ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} onClick={() => console.log()} />
                            : <Avatar bg='green.500' icon={<AiOutlinePushpin fontSize='1.5rem' />} onClick={() => console.log()} />
                        }

                        <VStack align="start" w="85vw">
                            <Tabs variant={"enclosed"} colorScheme='green'>
                                <TabList>
                                    {resultItems.map((resultItem: QueryResultItem, idx: number) => (
                                        <Tab key={idx}>
                                            FAQ {idx}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                        <TabPanel key={idx}>
                                            <HStack>
                                                <VStack mt="5">
                                                    <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                        submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                    <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                        submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                </VStack>

                                                <VStack align={"left"}>
                                                    <Heading size="sm">
                                                        <a href={resultItem.DocumentURI} onClick={() => {
                                                            submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                        }}>
                                                            <HighlightedTexts textWithHighlights={
                                                                getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "QuestionText") ?? { Highlights: [], Text: "読み込みエラー" }
                                                            } />
                                                        </a>
                                                    </Heading>
                                                    <Box>
                                                        <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                    </Box>
                                                </VStack>
                                            </HStack>
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        </VStack>
                    </HStack>
                </Box>
            )
        } else {
            return (<></>)
        }
    }

// 文章のリストを表示する
export const KendraResultDoc: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <>
                    {
                        resultItems.map((resultItem, idx: number) => (
                            <Box key={idx}>
                                <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                                    {true
                                        ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} onClick={() => console.log()} />
                                        : <Avatar bg='green.500' icon={<AiOutlinePushpin fontSize='1.5rem' />} onClick={() => console.log()} />
                                    }
                                    <VStack mt="5">
                                        <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                            submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                        <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                            submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                    </VStack>
                                    <VStack align="start" w="85vw">
                                        <Heading size="sm">
                                            <a href={resultItem.DocumentURI ?? "#"} onClick={() => {
                                                submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                            }}>
                                                <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            </a>
                                        </Heading>
                                        <Box>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                        </Box>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))
                    }
                </>
            )
        } else {
            return (<></>)
        }
    }

const Kendra: React.FC<{ data: Conversation }> = ({ data }) => {
    const [featuredItems, setFeaturedItems] = useState<FeaturedResultsItem[]>([]);
    const [faqItems, setFaqItems] = useState<QueryResultItem[]>([]);
    const [excerptItems, setExcerptItems] = useState<QueryResultItem[]>([]);
    const [docItems, setDocItems] = useState<QueryResultItem[]>([]);

    useEffect(() => {
        const tmpFeaturedItems: FeaturedResultsItem[] = [];
        const tmpFaqItems: QueryResultItem[] = [];
        const tmpExcerptItems: QueryResultItem[] = [];
        const tmpDocItems: QueryResultItem[] = [];

        const parseData = async () => {
            // Featured Item が S3 のとき presigned urlに変更
            if (data && data?.kendraResponse?.FeaturedResultsItems) {

                for (const result of data.kendraResponse.FeaturedResultsItems) {
                    if (s3Client && result.DocumentURI) {
                        try {
                            let res = result.DocumentURI.split("/");
                            if (res[2].startsWith("s3")) {

                                // bucket名とkeyを取得
                                let bucket = res[3];
                                let key = res[4];
                                for (var i = 5; i < res.length; i++) {
                                    key = key + "/" + res[i];
                                }
                                // s3 の presigned url に置き換え
                                const command = new GetObjectCommand({ Bucket: bucket, Key: key });
                                await getSignedUrl(s3Client, command, { expiresIn: 3600 }).then((uri: string) => {
                                    result.DocumentURI = uri;
                                });
                            }
                        } catch {
                            // S3 以外はなにもしない (Just do nothing, so the documentURI are still as before)
                        }
                    }
                    tmpFeaturedItems.push(result)
                }
            }

            // FAQ、抜粋した回答、ドキュメントを分離
            if (data && data?.kendraResponse?.ResultItems) {
                for (const result of data.kendraResponse.ResultItems) {
                    if (s3Client && result.DocumentURI) {
                        try {
                            let res = result.DocumentURI.split("/");
                            if (res[2].startsWith("s3")) {

                                // bucket名とkeyを取得
                                let bucket = res[3];
                                let key = res[4];
                                for (var i = 5; i < res.length; i++) {
                                    key = key + "/" + res[i];
                                }
                                // s3 の presigned url に置き換え
                                const command = new GetObjectCommand({ Bucket: bucket, Key: key });
                                getSignedUrl(s3Client, command, { expiresIn: 3600 }).then((uri: string) => {
                                    result.DocumentURI = uri;
                                });

                            }
                        } catch {
                            // S3 以外はなにもしない (Just do nothing, so the documentURI are still as before)
                        }
                    }
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
        }
        parseData()


    }, []);

    return (
        <>
            {/* aiResult があれば出力 */}
            {data.aiResponse && <AICore data={data.aiResponse} />}
            {/* FeaturedResultを表示 */}
            <KendraResultFeatured queryId={data.kendraResponse?.QueryId} resultItems={featuredItems} />
            {/* FAQを表示 */}
            <KendraResultFAQ queryId={data.kendraResponse?.QueryId} resultItems={faqItems} />
            {/* 抜粋した回答を表示 */}
            <KendraResultExcerpt queryId={data.kendraResponse?.QueryId} resultItems={excerptItems} />
            {/* 文章のリストを表示 */}
            <KendraResultDoc queryId={data.kendraResponse?.QueryId} resultItems={docItems} />
            {/* 人の入力を表示 */}
            <Human data={data} />
        </>
    )
};
export default Kendra;