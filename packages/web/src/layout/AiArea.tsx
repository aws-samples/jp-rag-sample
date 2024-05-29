// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Button, Flex } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/layout';
import { useGlobalContext } from '../utils/useGlobalContext';
import {
  Accordion,
  AccordionItem,
  Box,
  HStack,
  Text,
  Link,
} from '@chakra-ui/react';
import { getKendraQuery, kendraQuery, infClaude } from '../utils/service';
import {
  getCurrentSortOrder,
  getAttributeFilter,
  kendraResultToAiSelectedInfo,
  createQuotePrompt,
  parseAnswerFromGeneratedQuotes,
  createFinalAnswerPrompt,
} from '../utils/function';
import { AiSelectedInfo } from '../utils/interface';
// i18
import { useTranslation } from 'react-i18next';
import { ChatIcon, SearchIcon } from '@chakra-ui/icons';

export default function AiArea() {
  // 画面中央の表示
  // 言語設定
  const { t } = useTranslation();

  const {
    filterOptions: filterOptions,
    currentInputText: currentInputText,
    currentQueryId: currentQueryId,
    aiAgent: aiAgent,
    setAiAgent: setAiAgent,
  } = useGlobalContext();

  return (
    <Flex w="30%">
      <Box p="5" w="100%">
        <Box
          m="3"
          borderRadius="10px"
          boxShadow="1px 1px 5px var(--chakra-colors-green-500)"
          border="1px var(--chakra-colors-green-500)">
          <h2>
            <Text p="3" fontWeight="bold">
              {t('right_side_bar.ai_agent')}
            </Text>
          </h2>
          <VStack p={2} alignItems="flex-start">
            <Accordion w="100%" allowMultiple>
              {/* 回答 */}
              <AccordionItem>
                <Box p="3">
                  <HStack>
                    <ChatIcon />
                    <Text>{currentInputText}</Text>
                  </HStack>
                  <HStack p="3">
                    <span>
                      {aiAgent[currentQueryId].aiAgentResponse
                        ?.split('\n')
                        .map((item, idx) => {
                          return (
                            <p key={idx}>
                              {item}
                              <br />
                            </p>
                          );
                        })}
                    </span>
                  </HStack>
                </Box>
              </AccordionItem>

              {/* 引用元 */}
              <AccordionItem>
                <Box p="3">
                  <HStack>
                    <Text>{t('right_side_bar.quote')}</Text>
                  </HStack>
                  <HStack>
                    <VStack p="3" align="left">
                      {aiAgent[currentQueryId].aiSelectedInfoList.map(
                        (item, idx) => {
                          return (
                            <Link href={item.url} key={idx} isExternal>
                              <Text>
                                [{idx}] {item.title}
                              </Text>
                            </Link>
                          );
                        }
                      )}
                    </VStack>
                  </HStack>
                </Box>
              </AccordionItem>

              {/* 検索サジェスト */}
              <AccordionItem>
                <Box p="3">
                  <HStack>
                    <SearchIcon />
                    <Text>{t('right_side_bar.suggest_query')}</Text>
                  </HStack>
                  <HStack>
                    <VStack p="3" align="left">
                      {aiAgent[currentQueryId].suggestedQuery.map(
                        (item, idx) => {
                          return <Text key={idx}>- {item}</Text>;
                        }
                      )}
                    </VStack>
                  </HStack>
                </Box>
              </AccordionItem>

              {/* 深堀り */}
              <AccordionItem textAlign={'right'}>
                <Button
                  colorScheme="green"
                  isDisabled={!aiAgent[currentQueryId].diveDeepIsEnabled}
                  onClick={() => {
                    // ボタンを無効化
                    setAiAgent((prev) => {
                      return {
                        ...prev,
                        [currentQueryId]: {
                          ...prev[currentQueryId],
                          diveDeepIsEnabled: false,
                        },
                      };
                    });

                    const run = async () => {
                      // 検索したいクエリリスト
                      const suggestedQueries =
                        aiAgent[currentQueryId].suggestedQuery;

                      // 並列で複数のクエリを実行
                      const kendraResults = await Promise.all(
                        suggestedQueries.map(async (query) => {
                          const kendraQueryInput = await getKendraQuery(
                            query,
                            getAttributeFilter(filterOptions),
                            getCurrentSortOrder(filterOptions)
                          );
                          return kendraQuery(kendraQueryInput);
                        })
                      );
                      console.log('[検索結果] kendraResults');
                      console.log(kendraResults);

                      // 引用を生成
                      const parsedResults = kendraResults.map((result) =>
                        kendraResultToAiSelectedInfo(result)
                      );
                      const streamQuotes = await Promise.all(
                        parsedResults.map((parsedResult, index) =>
                          infClaude(
                            createQuotePrompt(
                              parsedResult,
                              suggestedQueries[index]
                            )
                          )
                        )
                      );
                      console.log('[引用] streamQuotes');
                      console.log(streamQuotes);

                      // AI が生成した関連度の高いドキュメント一覧を構造化
                      const aiSelectedInfoLists = await Promise.all(
                        streamQuotes.map(async (streamQuote, index) => {
                          const parsedAnswer = parseAnswerFromGeneratedQuotes(
                            '<Answer>' + streamQuote
                          );
                          const relevantSelectedInfoMap = new Map<
                            number,
                            AiSelectedInfo
                          >();
                          parsedAnswer.quotes.forEach((quote) => {
                            const info = parsedResults[index].find(
                              (_, index) => index === quote.documentIndex
                            );
                            if (info !== undefined) {
                              relevantSelectedInfoMap.set(
                                quote.documentIndex,
                                info
                              );
                            }
                          });
                          return Array.from(relevantSelectedInfoMap.values());
                        })
                      );
                      console.log(
                        '[構造化されたドキュメント一覧] aiSelectedInfoLists'
                      );
                      console.log(aiSelectedInfoLists);

                      // 最終的な回答を生成
                      const prompt = createFinalAnswerPrompt(
                        aiSelectedInfoLists
                          .flat()
                          .concat(aiAgent[currentQueryId].aiSelectedInfoList),
                        aiAgent[currentQueryId].userQuery
                      );
                      const final_answer = await infClaude(prompt);

                      console.log('[最終的な回答] final_answer');
                      console.log(final_answer);

                      // 画面描画を更新
                      setAiAgent((prev) => {
                        return {
                          ...prev,
                          [currentQueryId]: {
                            ...prev[currentQueryId],
                            aiSelectedInfoList: aiSelectedInfoLists
                              .flat()
                              .concat(
                                aiAgent[currentQueryId].aiSelectedInfoList
                              ),
                            aiAgentResponse: final_answer,
                          },
                        };
                      });
                    };
                    run();
                  }}>
                  {t('right_side_bar.dive_deep_button')}
                </Button>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
