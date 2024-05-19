// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { HStack, Input, InputGroup, Text, useToast } from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { AiOutlineBulb, AiOutlineFieldTime } from 'react-icons/ai';
import { useGlobalContext } from '../App';
import {  getKendraQuery, infStreamClaude, kendraQuery } from '../utils/service.ts';
import { getAttributeFilter, getCurrentSortOrder, getFiltersFromQuery, createFinalAnswerPrompt, createNextQeuryPrompt, createQuotePrompt, kendraResultToAiSelectedInfo, parseAnswerFromGeneratedQuotes, parseNextQueryFromSuggestion } from '../utils/function';
import { AiAgentStatus, AiSelectedInfo, Conversation } from '../utils/interface';
import { MAX_QUERY_SUGGESTION, RECENT_QUERY_CAPACITY, TOP_QUERIES } from '../utils/constant';
import { QueryResult } from "@aws-sdk/client-kendra";

// i18
import { useTranslation } from "react-i18next";


const InputWithSuggest: React.FC = () => {
    // 言語設定
    const { t } = useTranslation();

    // global変数
    const {
        currentConversation: currentConversation,
        setCurrentConversation: setCurrentConversation,
        filterOptions: filterOptions,
        setFilterOptions: setFilterOptions,
        datasourceInfo: datasourceInfo,
        currentInputText: currentInputText,
        setCurrentInputText: setCurrentInputText,
        recentQueryList: recentQueryList,
        setRecentQueryList: setRecentQueryList,
        setCurrentQueryId: setCurrentQueryId,
        setAiAgent: setAiAgent
    } = useGlobalContext();

    // local 変数
    const [suggestedQueryOptions, setFilteredOptions] = useState(TOP_QUERIES.slice(0, MAX_QUERY_SUGGESTION));  // AIによるサジェストクエリ
    const [showOptions, setShowOptions] = useState(false);  // サジェストの表示状態
    const [currentFocus, setCurrentFocus] = useState(-1);  // 選択されたサジェスト位置
    const inputRef = useRef<HTMLInputElement>(null);  // 入力フィールドのDOM
    const timeoutId = useRef<NodeJS.Timeout | null>(null);  // サジェストの非表示を制御するためのtimeout
    const toast = useToast();  // トースト表示

    const kendraSearch = async (queryText: string): Promise<QueryResult> => {
        // currentInputTextだと、useStateフックが更新される前に search 処理が走ることになるため、引数にqueryTextを取る

        /*
         * Kendraへのリクエスト
         *
         * 
         * K. top barからの検索時
         * 
         * K-1. 今 Interaction Areaに何かが表示されている場合は、historyに退避
         * K-2. フィルタをリセット
         * K-3. 現在設定中のfilterは見ずに、言語設定とソート順序だけを反映させてKendraへQuery
         * K-4. 受け取ったレスポンスを元にInteractionAreaを描画
         * K-5. Query結果からフィルタ候補を取得
         * K-6. FilterBarの設定とソート順序以外を更新
         */

        // K-1. 今 Interaction Areaに何かが表示されている場合は、historyに退避
        if (currentConversation !== undefined) {
            setCurrentConversation(undefined)
        }
        // K-2. フィルタをリセット
        setFilterOptions([
            filterOptions[0], // 言語設定
            filterOptions[1], // ソート順序
        ])
        // K-3. 現在設定中のfilterは見ずに、言語設定とソート順序だけを反映させてKendraへQuery
        const q = getKendraQuery(
            queryText,
            getAttributeFilter(filterOptions),
            getCurrentSortOrder(filterOptions)
        )

        try {
            const data = await kendraQuery(q);
            const a: Conversation = {
                conversationType: "HUMAN_KENDRA",
                userInput: { word: queryText },
                userQuery: q,
                kendraResponse: data,
                aiResponse: undefined
            }
            // K-4. 受け取ったレスポンスを元にInteractionAreaを描画
            setCurrentConversation(a)
            // K-5. Query結果からフィルタ候補を取得
            // K-6. FilterBarの設定とソート順序以外を更新
            if (data) {
                setFilterOptions([
                    filterOptions[0], // 言語設定
                    filterOptions[1], // ソート順序
                    ...getFiltersFromQuery(data, datasourceInfo)]) // クエリから受け取ったフィルタ候補
            }
            return data;
        } catch (err) {
            console.log(err)
            toast({
                title: t("toast.fail_kendra"),
                description: "",
                status: 'error',
                duration: 1000,
                isClosable: true,
            })
            throw err;
        }
    }

    const research = async (queryText: string) => {
        /**
         * Kendra と genAI で調査
         */

        // 現在時刻を取得
        const currentTime = new Date().getTime();
        const queryId = `${currentTime}-${queryText}`;

        // aiAgentに新しいモックデータを入れる
        const mockAiAgentStatus: AiAgentStatus = {
            aiAgentResponse: '',
            aiSelectedInfoList: [],
            suggestedQuery: [],
            systemLog: [],
            diveDeepIsEnabled: false
        };
        setAiAgent(prev => ({
            ...prev,
            [queryId]: mockAiAgentStatus,
        }));

        // currentQueryIdを設定
        setCurrentQueryId(queryId);

        // 検索履歴として追加
        setRecentQueryList(prevList => {
            // prevListの0番目の要素がvalueと同じなら変更しない
            if (prevList[0] === queryText) {
                return prevList;
            }
            // RECENT_QUERY_CAPACITY より大きい場合、prevListの最後の要素を削除
            if (prevList.length >= RECENT_QUERY_CAPACITY) {
                prevList.pop();
            }
            return [queryText, ...prevList];
        });

        // 検索
        const kendraResult = await kendraSearch(queryText);

        console.log("kendraResult");
        console.log(kendraResult);
        const parsedResult = kendraResultToAiSelectedInfo(kendraResult);
        console.log("parsedResult");
        console.log(parsedResult);

        // 検索後 サジェストを再表示
        setShowOptions(false);

        // 引用候補を生成
        const streamQuote = await infStreamClaude(createQuotePrompt(parsedResult, queryText));
        let tmpResultQuote = "";
        for await (const chunk of streamQuote) {
            tmpResultQuote += chunk;
            setAiAgent(prev => {
                return {
                    ...prev,
                    [queryId]: {
                        ...prev[queryId],
                        aiAgentResponse: prev[queryId].aiAgentResponse + chunk
                    }
                };
            })
        }

        // 生成した引用を構造化
        console.log("tmpResultQuote")
        console.log(tmpResultQuote)

        const parsedAnswer = parseAnswerFromGeneratedQuotes("<Answer>" + tmpResultQuote)
        const relevantSelectedInfoMap = new Map<number, AiSelectedInfo>();
        parsedAnswer.quotes.forEach(quote => {
            const info = parsedResult.find((_, index) => index === quote.documentIndex);
            if (info !== undefined) {
                relevantSelectedInfoMap.set(quote.documentIndex, info);
            }
        });
        const relevantSelectedInfo: AiSelectedInfo[] = Array.from(relevantSelectedInfoMap.values());


        // 引用を画面描画
        console.log("relevantSelectedInfo");
        console.log(relevantSelectedInfo);
        setAiAgent(prev => {
            return {
                ...prev,
                [queryId]: {
                    ...prev[queryId],
                    aiSelectedInfoList: relevantSelectedInfo
                }
            };
        })

        // AI エージェントの吹き出しの内容をリセット
        if (relevantSelectedInfo.length <= 0) {
            setAiAgent(prev => {
                return {
                    ...prev,
                    [queryId]: {
                        ...prev[queryId],
                        aiAgentResponse: "関連する文章はみつかりませんでした。"
                    }
                };
            })
        } else {
            setAiAgent(prev => {
                return {
                    ...prev,
                    [queryId]: {
                        ...prev[queryId],
                        aiAgentResponse: ""
                    }
                };
            })

            // 最終回等を生成
            console.log("createFinalAnswerPrompt(relevantSelectedInfo, queryText)")
            console.log(createFinalAnswerPrompt(relevantSelectedInfo, queryText))

            const streamFinalAnswer = await infStreamClaude(createFinalAnswerPrompt(relevantSelectedInfo, queryText));
            let tmpResultAnswer = "";
            for await (const chunk of streamFinalAnswer) {
                tmpResultAnswer += chunk;
                setAiAgent(prev => {
                    return {
                        ...prev,
                        [queryId]: {
                            ...prev[queryId],
                            aiAgentResponse: prev[queryId].aiAgentResponse + chunk
                        }
                    };
                })
            }
        }

        // 次のクエリ候補を作成
        console.log("createNextQeuryPrompt(tmpResultQuote, queryText)")
        console.log(createNextQeuryPrompt(tmpResultQuote, queryText))

        const streamNextQuery = await infStreamClaude(createNextQeuryPrompt(tmpResultQuote, queryText));
        let tmpNextQuery = "";
        for await (const chunk of streamNextQuery) {
            tmpNextQuery += chunk;
        }

        // 生成されたクエリ候補を構造化
        console.log("tmpNextQuery")
        console.log(tmpNextQuery)

        const nextquery = parseNextQueryFromSuggestion(tmpNextQuery);

        // クエリ候補を描画
        console.log("nextquery");
        console.log(nextquery);

        setAiAgent(prev => {
            return {
                ...prev,
                [queryId]: {
                    ...prev[queryId],
                    suggestedQuery: nextquery,
                    diveDeepIsEnabled: true
                }
            };
        })
    }


    // 入力フィールドの値変更時の挙動
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 入力フィールドの値を取得し記録
        const value = e.target.value;
        setCurrentInputText(value);

        // 入力があれば、TOP_QUERIES の中から絞り込む、ただし候補数を制限
        setFilteredOptions(
            TOP_QUERIES.filter(option =>
                option.toLowerCase().includes(value.toLowerCase())
            ).slice(0, MAX_QUERY_SUGGESTION)
        );


        setCurrentFocus(-1);
    };

    // サジェスト候補をクリック時の挙動
    const handleOptionClick = (value: string) => {
        // クリックした候補の値を入力フィールドに代入
        setCurrentInputText(value);

        // 検索履歴として追加
        setRecentQueryList(prevList => {
            // prevListの0番目の要素がvalueと同じなら変更しない
            if (prevList[0] === value) {
                return prevList;
            }
            // RECENT_QUERY_CAPACITY より大きい場合、prevListの最後の要素を削除
            if (prevList.length >= RECENT_QUERY_CAPACITY) {
                prevList.pop();
            }
            return [value, ...prevList];
        });
        // 調査
        research(value)

        // サジェストを再表示
        setShowOptions(false);
        timeoutId.current = setTimeout(() => {
            setShowOptions(true);
        }, 200);

        // サジェストのフォーカスを外す
        setCurrentFocus(-1);
    };

    // 入力フィールド選択時にサジェスト候補を表示
    const handleInputFocus = () => {
        setShowOptions(true);
    };

    const handleInputBlur = () => {
        setCurrentFocus(-1);  // サジェストのフォーカスを外す

        // div の onClick より input の onBlur が優先されてしまうので、遅らせる
        timeoutId.current = setTimeout(() => {
            setShowOptions(false);
        }, 200);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        // キーストロークがあった場合はサジェストを表示
        setShowOptions(true);

        if (e.nativeEvent.isComposing || (e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Escape')) return

        // エスケープキーが押された場合
        if (e.key === 'Escape') {
            setShowOptions(false); // サジェストを非表示にする
            return;
        }

        // タブキーが押された場合
        if (e.key === 'Tab') {
            e.preventDefault(); // タブキーの標準動作を防ぐ

            // currentFocusの値をローテーション
            setCurrentFocus((prevFocus) => {
                const totalOptions = recentQueryList.length + suggestedQueryOptions.length;
                if (prevFocus === -1) {
                    return 0; // 最初の候補を選択
                } else if (prevFocus === totalOptions - 1) {
                    return -1; // 最後の候補から戻る
                } else {
                    return prevFocus + 1; // 次の候補を選択
                }
            });
            return;
        }
        let tmpInputText = currentInputText;

        // Enterキーが押された場合
        // currentFocusが-1より大きい場合、選択されているサジェスト候補を入力フィールドに設定
        if (currentFocus >= 0) {
            const selectedOption = currentFocus < recentQueryList.length
                ? recentQueryList[currentFocus]
                : suggestedQueryOptions[currentFocus - recentQueryList.length];
            setCurrentInputText(selectedOption);
            tmpInputText = selectedOption;
        }

        // なにか入力があるときのみ実行
        if (tmpInputText === "") { return }

        // 調査
        research(tmpInputText)
    }
    
    return (
        <InputGroup size='md' w="60vw">
            {/* 入力フィールド */}
            <Input
                ref={inputRef}
                type="text"
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{ borderRadius: showOptions ? '5px 5px 0 0' : '5px' }}
                placeholder={t("top_bar.search")}
                value={currentInputText}
                onKeyDown={handleKeyDown}
            />

            {/* サジェスト候補 */}
            {showOptions && (
                <div id="browsers" style={{ position: 'absolute', width: '100%', overflowY: 'auto', display: 'block', top: '50px' }}>
                    {/* 履歴によるサジェスト */}
                    {recentQueryList.map((option, index) => (
                        <HStack
                            key={'history' + option + index}
                            onClick={() => handleOptionClick(option)}
                            onMouseEnter={() => setCurrentFocus(index)}  // マウスカーソルが乗ったものを記録
                            onMouseLeave={() => setCurrentFocus(-1)}  // マウスカーソルが外れたことを記録
                            style={{
                                backgroundColor: currentFocus === index ? 'var(--chakra-colors-green-100)' : 'white',  // マウスカーソルが乗ったものの色を変える
                                cursor: 'pointer',
                                padding: '5px',
                                border: '1px solid lightgray'
                            }}
                        >
                            <AiOutlineFieldTime fontSize='1rem' />
                            <Text>{option}</Text>
                        </HStack>
                    ))}

                    {/* AIによるサジェスト */}
                    {suggestedQueryOptions.map((option, index) => (
                        <HStack
                            key={'ai' + option + index}
                            onClick={() => handleOptionClick(option)}
                            onMouseEnter={() => setCurrentFocus(index + recentQueryList.length)}  // マウスカーソルが乗ったものを記録
                            onMouseLeave={() => setCurrentFocus(-1)}  // マウスカーソルが外れたことを記録
                            style={{
                                backgroundColor: currentFocus === index + recentQueryList.length ? 'var(--chakra-colors-green-100)' : 'white',  // マウスカーソルが乗ったものの色を変える
                                cursor: 'pointer',
                                padding: '5px',
                                border: '1px solid lightgray'
                            }}
                        >
                            <AiOutlineBulb fontSize='1rem' />
                            <Text>{option}</Text>
                        </HStack>
                    ))}
                </div>
            )}
        </InputGroup>
    );
};

export default InputWithSuggest;