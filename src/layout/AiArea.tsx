// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import {
    Button,
    Flex,
} from '@chakra-ui/react';
import { VStack } from "@chakra-ui/layout"
import { useGlobalContext } from '../App';
import { Accordion, AccordionItem, Box, HStack, Text } from "@chakra-ui/react";
// i18
import { useTranslation } from "react-i18next";
import { ChatIcon, SearchIcon } from "@chakra-ui/icons";

export default function AiArea({ }: {}) {
    // 画面中央の表示
    // 言語設定
    const { t } = useTranslation();

    const {
        currentInputText: currentInputText,
        currentQueryId: currentQueryId,
        aiAgent: aiAgent,
    } = useGlobalContext();

    return (
        <Flex w="30%">
            <Box p="5" w="100%">
                <Box
                    m="3"
                    borderRadius="10px"
                    boxShadow="1px 1px 5px var(--chakra-colors-green-500)"
                    border="1px var(--chakra-colors-green-500)">
                    <h2 ><Text p='3' fontWeight="bold">{t("right_side_bar.ai_agent")}</Text></h2>
                    <VStack p={2} alignItems="flex-start">
                        <Accordion w="100%" allowMultiple>
                            {/* 回答 */}
                            <AccordionItem>
                                <Box p='3'>
                                    <HStack>
                                        <ChatIcon />
                                        <Text>{currentInputText}</Text>
                                    </HStack>
                                    <HStack p="3">
                                        <span>{
                                            aiAgent[currentQueryId].aiAgentResponse?.split("\n").map((item, idx) => {
                                                return (
                                                    <p key={idx}>{item}<br /></p>
                                                );
                                            })
                                        }</span>
                                    </HStack>
                                </Box>
                            </AccordionItem>

                            {/* 引用元 */}
                            <AccordionItem>
                                <Box p='3'>
                                    <HStack>
                                        <Text>{t("right_side_bar.quote")}</Text>
                                    </HStack>
                                    <HStack>
                                        <VStack p="3" align="left">
                                            {
                                                aiAgent[currentQueryId].aiSelectedInfoList.map((item, idx) => {
                                                    return (
                                                        <a href={item.url} key={idx}><Text >[{idx}] {item.title}</Text></a>
                                                    )
                                                })
                                            }
                                        </VStack>
                                    </HStack>
                                </Box>
                            </AccordionItem>

                            {/* 検索サジェスト */}
                            <AccordionItem>
                                <Box p='3'>
                                    <HStack>
                                        <SearchIcon />
                                        <Text>{t("right_side_bar.suggest_query")}</Text>
                                    </HStack>
                                    <HStack>
                                        <VStack p="3" align="left">
                                            {
                                                aiAgent[currentQueryId].suggestedQuery.map((item, idx) => {
                                                    return (
                                                        <Text key={idx}>- {item}</Text>
                                                    )
                                                })
                                            }
                                        </VStack>
                                    </HStack>
                                </Box>
                            </AccordionItem>

                            {/* 深堀り */}
                            <AccordionItem textAlign={'right'}>
                                <Button colorScheme='green' isDisabled={!aiAgent[currentQueryId].diveDeepIsEnabled}>{t("right_side_bar.dive_deep_button")}</Button>
                            </AccordionItem>
                        </Accordion>
                    </VStack>
                </Box>
            </Box>
        </Flex >
    )
}