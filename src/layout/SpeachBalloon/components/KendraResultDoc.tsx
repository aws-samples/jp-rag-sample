// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import { Box, HStack, Heading, VStack } from "@chakra-ui/layout";
import { Text, useToast } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/button";
import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import HighlightedTexts from "./HighlightedTexts";
import { QueryResultItem } from "@aws-sdk/client-kendra";
import { Relevance, submitFeedback } from "../../../utils/service";
import { useGlobalContext } from '../../../App';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";
// i18
import { useTranslation } from "react-i18next";


export const KendraResultDoc: React.FC<{
    queryId: string | undefined;
    resultItems: QueryResultItem[];

}> = ({
    queryId, resultItems,
}) => {
        // 言語設定
        const { t } = useTranslation();

        // 文章のリストを表示する
        const {
            pinnedTexts: pinnedTexts, setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast();

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <>
                    <Box borderColor="green.500">
                        <HStack p='30px'>
                            <Text>{t("body.related_sentence")}</Text>
                        </HStack>
                    </Box>
                    {resultItems.map((resultItem, idx: number) => (
                        <Box key={idx} borderColor="green.500">
                            <VStack minH='10vh' pl='30px' pr='30px' align="start" w="85vw" bg={true ? "white" : "yellow.100"}>
                                <Heading size="sm">
                                    <Link color="green.500" href={resultItem.DocumentURI ?? "#"} onClick={() => {
                                        submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId);
                                    }} isExternal>
                                        <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                        <ExternalLinkIcon mx='2px' />
                                    </Link>
                                </Heading>
                                <Box onClick={() => {
                                    setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"]);
                                    toast({
                                        title: t("toast.pinned"),
                                        description: "",
                                        status: 'success',
                                        duration: 1000,
                                        isClosable: true,
                                    });
                                }}>
                                    <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                </Box>
                                <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                    <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                        toast({
                                            title: t("toast.thanks_feedback"),
                                            description: "",
                                            status: 'success',
                                            duration: 1000,
                                            isClosable: true,
                                        });
                                        submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId);
                                    }} />
                                    <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                        toast({
                                            title: t("toast.thanks_feedback"),
                                            description: "",
                                            status: 'success',
                                            duration: 1000,
                                            isClosable: true,
                                        });
                                        submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId);
                                    }} />
                                </HStack>
                            </VStack>
                        </Box>
                    ))}
                </>
            );
        } else {
            return (<>
                <Box borderColor="green.500">
                    <HStack p='30px'>
                        <Text>{t("body.related_sentence")}</Text>
                    </HStack>
                </Box>
                <Box borderColor="green.500">
                    <HStack p='30px'>
                        <Text>{t("body.no_result")}</Text>
                    </HStack>
                </Box>
            </>);
        }
    };
