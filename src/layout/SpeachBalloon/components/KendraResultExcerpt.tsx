// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import { Box, HStack, Heading, VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import { IconButton } from "@chakra-ui/button";
import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import HighlightedTexts from "./HighlightedTexts";
import { QueryResultItem } from "@aws-sdk/client-kendra";
import { Relevance, submitFeedback } from "../../../utils/service";
import { useGlobalContext } from '../../../App';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getFAQWithHighlight, getNounAnswerFromExcerpt } from "../../../utils/function";



export const KendraResultExcerpt: React.FC<{
    queryId: string | undefined;
    resultItems: QueryResultItem[];
}> = ({ queryId, resultItems }) => {
    // 抜粋した回答を返す
    const {
        pinnedTexts: pinnedTexts, setPinnedTexts: setPinnedTexts,
    } = useGlobalContext();

    const toast = useToast();

    if (queryId !== undefined && resultItems.length > 0) {
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
                                                    submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId);
                                                }} isExternal>
                                                    <strong>
                                                        {getNounAnswerFromExcerpt(getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText"))}
                                                    </strong>
                                                    <ExternalLinkIcon mx='2px' />
                                                </Link>
                                            </Heading>
                                            <Box onClick={() => {
                                                setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"]);
                                                toast({
                                                    title: 'テキストがピン止めされました',
                                                    description: "",
                                                    status: 'success',
                                                    duration: 1000,
                                                    isClosable: true,
                                                });
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
                                                    });
                                                    submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId);
                                                }} />
                                                <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                    toast({
                                                        title: 'フィードバックありがとうございます',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    });
                                                    submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId);
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
        );
    } else {
        return (<></>);
    }
};
