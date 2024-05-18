// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import {
    Flex,
} from '@chakra-ui/react';
import { VStack } from "@chakra-ui/layout"
import { useGlobalContext } from '../App';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, HStack, Text } from "@chakra-ui/react";
// i18
import { useTranslation } from "react-i18next";
import { ChatIcon } from "@chakra-ui/icons";

export default function AiArea({ }: {}) {
    // 画面中央の表示
    // 言語設定
    const { t } = useTranslation();

    const {
        aiResponse: aiResponse,
        currentInputText: currentInputText
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
                                            aiResponse?.split("\n").map((item, idx) => {
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
                                        <Text>引用元</Text>
                                    </HStack>
                                    <HStack>
                                        <VStack p="3" align="left">
                                            <Text>- 引用1</Text>
                                            <Text>- 引用2</Text>
                                            <Text>- 引用3</Text>
                                            <Text>- 引用4</Text>
                                        </VStack>
                                    </HStack>
                                </Box>
                            </AccordionItem>

                            {/* 検索サジェスト */}
                            <AccordionItem>
                                <Box p='3'>
                                    <HStack>
                                        <Text>検索サジェスト</Text>
                                    </HStack>
                                    <HStack>
                                        <VStack p="3" align="left">
                                            <Text>- hogefuga</Text>
                                            <Text>- fugahoge</Text>
                                            <Text>- aaaa</Text>
                                            <Text>- bbbb</Text>
                                        </VStack>
                                    </HStack>
                                </Box>
                            </AccordionItem>

                            {/* System */}
                            <AccordionItem>
                                <AccordionButton>
                                    <Text>システム</Text>
                                    <AccordionIcon />
                                </AccordionButton>

                                <AccordionPanel>

                                    <Accordion allowMultiple>
                                        {/* クロール */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>クロールした場合に追加情報がありそうなリンクを絞り込みます</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>

                                                    <Text>クロールした場合に追加情報がありそうなリンクを絞り込みます</Text>
                                                </HStack>

                                                {/* 並列でkendraを調査 */}
                                                <HStack>

                                                    <Text>クロールして最終更新日と引用を作成します</Text>
                                                </HStack>

                                                <HStack>

                                                    <Text>AI 回答を生成します</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>





                                        {/* 信頼度の判定 */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>回答を精査</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>

                                                    <Text>AI の回答が意味をなしているか判定中</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>不十分な回答であったため、調査を続けます</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>




                                        {/* ### クエリ拡張 ### */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>他のキーワードで調べます</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>検索クエリを○○個作りました</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <VStack>
                                                        <Text>検索クエリ1</Text>
                                                        <Text>検索クエリ2</Text>
                                                        <Text>検索クエリ3</Text>
                                                        <Text>検索クエリ4</Text>
                                                    </VStack>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>生成した検索クエリを調査します</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <VStack>
                                                        <Text>doc1</Text>
                                                        <Text>doc2</Text>
                                                        <Text>doc3</Text>
                                                        <Text>doc4</Text>
                                                    </VStack>
                                                </HStack>

                                                <HStack>

                                                    <Text>回答が含まれているか調べています</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <VStack>
                                                        <Text>引用1</Text>
                                                        <Text>引用2</Text>
                                                        <Text>引用3</Text>
                                                        <Text>引用4</Text>
                                                    </VStack>
                                                </HStack>

                                                <HStack>

                                                    <Text>回答を生成します</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>



                                        {/* 信頼度の判定 */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>回答を精査</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>

                                                    <Text>AI の回答が意味をなしているか判定中</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>不十分な回答であったため、調査を続けます</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>

                                        {/* クロール */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>クロールした場合に追加情報がありそうなリンクを絞り込みます</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>

                                                    <Text>クロールした場合に追加情報がありそうなリンクを絞り込みます</Text>
                                                </HStack>

                                                {/* 並列でkendraを調査 */}
                                                <HStack>

                                                    <Text>クロールして最終更新日と引用を作成します</Text>
                                                </HStack>

                                                <HStack>

                                                    <Text>AI 回答を生成します</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>

                                        {/* 信頼度の判定 */}
                                        <AccordionItem>
                                            <AccordionButton>

                                                <Text>回答を精査</Text>
                                                <AccordionIcon />
                                            </AccordionButton>

                                            <AccordionPanel>
                                                <HStack>

                                                    <Text>検索クエリのタイプを分類しています</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>タイプ調査結果: ファクトイド質問/ノンファクトイド質問/トラブルシューティング/挨拶/Action</Text>
                                                </HStack>

                                                <HStack>

                                                    <Text>AI の回答が意味をなしているか判定中</Text>
                                                </HStack>

                                                <HStack>
                                                    <ChatIcon />
                                                    <Text>不十分な回答であったため、調査を続けます</Text>
                                                </HStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </VStack>
                </Box>
            </Box>
        </Flex >
    )
}