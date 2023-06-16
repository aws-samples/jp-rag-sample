import { Box, HStack, Heading, VStack } from "@chakra-ui/layout"
import { Text, useToast } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import { IconButton } from "@chakra-ui/button";
import { Conversation } from "../../utils/interface";
import AICore from "./components/AICore";
import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import HighlightedTexts from "./components/HighlightedTexts";
import { FeaturedResultsItem, QueryResultItem, AdditionalResultAttribute, TextWithHighlights } from "@aws-sdk/client-kendra";
import { Relevance, s3Client, submitFeedback } from "../../services/AWS";
import Human from "./Human";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { useEffect, useState } from "react";
import { useGlobalContext } from '../../App';
import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";

// FeaturedResultを表示する
export const KendraResultFeatured: React.FC<{
    queryId: string | undefined,
    resultItems: FeaturedResultsItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500">
                    <VStack align="start" w="85vw" minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                        <Tabs variant={"enclosed"} colorScheme='green'>
                            <TabList>
                                {resultItems.map((_resultItem: FeaturedResultsItem, idx: number) => (
                                    <Tab key={idx}>
                                        おすすめの文章 {idx}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                                    <TabPanel key={idx}>
                                        <Heading size="sm">
                                            <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                            }}
                                                isExternal>
                                                <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                <ExternalLinkIcon mx='2px' />
                                            </Link>
                                        </Heading>
                                        <Box onClick={() => {
                                            setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                            toast({
                                                title: 'テキストがピン止めされました',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                        }}>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                        </Box>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    </VStack>
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
    const {
        pinnedTexts: pinnedTexts,
        setPinnedTexts: setPinnedTexts,
    } = useGlobalContext();

    const toast = useToast()

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
            <Box borderColor="green.500">
                <VStack align="start" w="85vw" minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                    <Tabs variant={"enclosed"} colorScheme='green'>
                        <TabList>
                            {resultItems.map((_resultItem: QueryResultItem, idx: number) => (
                                <Tab key={idx}>
                                    抜粋された文章 {idx}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels>
                            {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                <TabPanel key={idx}>
                                    <HStack>
                                        <VStack align={"left"}>
                                            <Heading size="sm">
                                                <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                    submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                }} isExternal>
                                                    <strong>
                                                        {
                                                            <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                        }
                                                    </strong>
                                                    <ExternalLinkIcon mx='2px' />
                                                </Link>
                                            </Heading>
                                            <Box onClick={() => {
                                                setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                                toast({
                                                    title: 'テキストがピン止めされました',
                                                    description: "",
                                                    status: 'success',
                                                    duration: 1000,
                                                    isClosable: true,
                                                })
                                            }}>
                                                <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            </Box>
                                            <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                                <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                    toast({
                                                        title: 'フィードバックありがとうございます',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                    submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                                <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                    toast({
                                                        title: 'フィードバックありがとうございます',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                    submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                </VStack>
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
        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500">
                    <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>

                        <VStack align="start" w="85vw">
                            <Tabs variant={"enclosed"} colorScheme='green'>
                                <TabList>
                                    {resultItems.map((_resultItem: QueryResultItem, idx: number) => (
                                        <Tab key={idx}>
                                            よくある質問 {idx}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                        <TabPanel key={idx}>
                                            <VStack align={"left"}>
                                                <Heading size="sm">
                                                    <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                        submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                    }} isExternal>
                                                        <HighlightedTexts textWithHighlights={
                                                            getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "QuestionText") ?? { Highlights: [], Text: "読み込みエラー" }
                                                        } />
                                                        <ExternalLinkIcon mx='2px' />
                                                    </Link>
                                                </Heading>
                                                <Box onClick={() => {
                                                    setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                                    toast({
                                                        title: 'テキストがピン止めされました',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                }} >
                                                    <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                </Box>
                                                <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                                    <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                        toast({
                                                            title: 'フィードバックありがとうございます',
                                                            description: "",
                                                            status: 'success',
                                                            duration: 1000,
                                                            isClosable: true,
                                                        })
                                                        submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                    <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                        toast({
                                                            title: 'フィードバックありがとうございます',
                                                            description: "",
                                                            status: 'success',
                                                            duration: 1000,
                                                            isClosable: true,
                                                        })
                                                        submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                </HStack>
                                            </VStack>
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
        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <>
                    <Box borderColor="green.500" >
                        <HStack p='30px'>
                            <Text>関連する文章</Text>
                        </HStack>
                    </Box>
                    {
                        resultItems.map((resultItem, idx: number) => (
                            <Box key={idx} borderColor="green.500">
                                <VStack minH='10vh' pl='30px' pr='30px' align="start" w="85vw" bg={true ? "white" : "yellow.100"}>
                                    <Heading size="sm">
                                        <Link color="green.500" href={resultItem.DocumentURI ?? "#"} onClick={() => {
                                            submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                        }} isExternal>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            <ExternalLinkIcon mx='2px' />
                                        </Link>
                                    </Heading>
                                    <Box onClick={() => {
                                        setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                        toast({
                                            title: 'テキストがピン止めされました',
                                            description: "",
                                            status: 'success',
                                            duration: 1000,
                                            isClosable: true,
                                        })
                                    }} >
                                        <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                    </Box>
                                    <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                        <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                            toast({
                                                title: 'フィードバックありがとうございます',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                            submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                        <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                            toast({
                                                title: 'フィードバックありがとうございます',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                            submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                    </HStack>
                                </VStack>
                            </Box>
                        ))
                    }
                </>
            )
        } else {
            return (<>
                <Box borderColor="green.500" >
                    <HStack p='30px'>
                        <Text>関連する文章</Text>
                    </HStack>
                </Box>
                <Box borderColor="green.500" >
                    <HStack p='30px'>
                        <Text>該当なし</Text>
                    </HStack>
                </Box>
            </>)
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
                            getSignedUrl(s3Client, command, { expiresIn: 3600 }).then((uri: string) => {
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

    }, [data]);

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