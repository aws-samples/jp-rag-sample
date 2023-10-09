// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import {
  Input,
  Flex,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  Button,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
  HStack,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  ChevronDownIcon
} from '@chakra-ui/icons';
import { CustomSetupTOTP } from './TOTP.tsx'
import { AiOutlinePushpin, AiOutlineDelete } from 'react-icons/ai';
import { useGlobalContext } from '../App';
import { getKendraQuery, inference, kendraQuery } from '../utils/service.ts';
import { SEARCH_MODE_LIST } from '../utils/constant';
import { getAttributeFilter, getCurrentSortOrder, getFiltersFromQuery } from '../utils/function';
import { Conversation, DocumentForInf } from '../utils/interface';
import { UseAuthenticator } from '@aws-amplify/ui-react-core';
import { AmplifyUser } from '@aws-amplify/ui';
// i18
import { useTranslation } from "react-i18next";

export type SignOut = UseAuthenticator['signOut'];


export default function TopBar({ logout, user }: { logout: SignOut | undefined, user: AmplifyUser | undefined },) {
  // 言語設定
  const { t } = useTranslation();

  // 画面上部の検索バー
  const {
    currentConversation: currentConversation,
    setCurrentConversation: setCurrentConversation,
    history: history,
    setHistory: setHistory,
    filterOptions: filterOptions,
    setFilterOptions: setFilterOptions,
    datasourceInfo: datasourceInfo,
    pinnedTexts: pinnedTexts,
    currentSearchMode: currentSearchMode,
    setCurrentSearchMode: setCurrentSearchMode,
    currentInputText: currentInputText,
    setCurrentInputText: setCurrentInputText,

  } = useGlobalContext();

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return

    // モード変更
    for (const ml of SEARCH_MODE_LIST) {
      if (currentInputText === ml) {
        setCurrentSearchMode(currentInputText)
        setCurrentInputText("")
        return
      }
    }

    // なにか入力があるときのみ実行
    if (currentInputText === "") { return }
    if (currentSearchMode === "#kendra") {
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
        setHistory([currentConversation, ...history])
        setCurrentConversation(undefined)
      }
      // K-2. フィルタをリセット
      setFilterOptions([
        filterOptions[0], // 言語設定
        filterOptions[1], // ソート順序
      ])
      // K-3. 現在設定中のfilterは見ずに、言語設定とソート順序だけを反映させてKendraへQuery
      const run = async () => {
        const q = getKendraQuery(
          currentInputText,
          getAttributeFilter(filterOptions),
          getCurrentSortOrder(filterOptions))
        await kendraQuery(q).then(data => {
          const a: Conversation = {
            conversationType: "HUMAN_KENDRA",
            userInput: { word: currentInputText },
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
        }).catch(err => {
          console.log(err)
          toast({
            title: t("toast.fail_kendra"),
            description: "",
            status: 'error',
            duration: 1000,
            isClosable: true,
          })
        })
      }
      run()

    } else if (currentSearchMode === "#rag") {
      /*
       * ragへのリクエスト
       * 
       * R-1. History へ追加
       * R-2. フィルタをリセット
       * R-3. 考え中の表示
       * R-4. Kendra へリクエスト
       * R-5. Kendra のレスポンスを表示
       * R-6. フィルタを表示
       * R-7. AI へリクエスト
       * R-8. AI のレスポンスを表示
       */
      // R-1. History へ追加
      if (currentConversation !== undefined) {
        setHistory([currentConversation, ...history])
        setCurrentConversation(undefined)
      }
      // R-2. フィルタをリセット
      setFilterOptions([
        filterOptions[0], // 言語設定
        filterOptions[1], // ソート順序
      ])
      // R-3. 考え中の表示
      setCurrentConversation({
        conversationType: "HUMAN_KENDRA_AI",
        userInput: { word: currentInputText },
        userQuery: undefined,
        aiResponse: {
          userUtterance: currentInputText,
          aiUtterance: "考え中...",
          actualPrompt: "",
          memory: undefined,
          usedTemplatePrompt: "",
          contexts: [],
          llmParam: {}
        },
        kendraResponse: undefined
      })

      // R-4. Kendra へリクエスト
      const run = async () => {
        const q = getKendraQuery(
          currentInputText,
          getAttributeFilter(filterOptions),
          getCurrentSortOrder(filterOptions))
        const kendraResponse = await kendraQuery(q).then(data => {
          const a: Conversation = {
            conversationType: "HUMAN_KENDRA",
            userInput: { word: currentInputText },
            userQuery: q,
            kendraResponse: data,
            aiResponse: {
              userUtterance: currentInputText,
              aiUtterance: "考え中...",
              actualPrompt: "",
              memory: undefined,
              usedTemplatePrompt: "",
              contexts: [],
              llmParam: {}
            }
          }
          // R-5. Kendra のレスポンスを表示
          setCurrentConversation(a)
          // R-6. フィルタを表示
          if (data) {
            setFilterOptions([
              filterOptions[0], // 言語設定
              filterOptions[1], // ソート順序
              ...getFiltersFromQuery(data, datasourceInfo)]) // クエリから受け取ったフィルタ候補
          }
          return data
        }).catch(err => {
          console.log(err)
          toast({
            title: t("toast.fail_kendra"),
            description: "",
            status: 'error',
            duration: 1000,
            isClosable: true,
          })
        })

        // コンテキストとして食わせる
        const context: DocumentForInf[] = []

        let ci = 0
        if (kendraResponse && kendraResponse?.ResultItems) {
          for await (const resultItem of kendraResponse?.ResultItems) {
            if (["VERY_HIGH", "HIGH", "MEDIUM"].includes(resultItem.ScoreAttributes?.ScoreConfidence ?? "")) {
              if (resultItem.Type === "QUESTION_ANSWER" && resultItem.AdditionalAttributes) {
                context.push({
                  excerpt: resultItem.DocumentExcerpt?.Text ?? "",
                  title: resultItem.AdditionalAttributes[0]?.Value?.TextWithHighlightsValue?.Text ?? "",
                  content: resultItem.DocumentURI ?? "",
                  type: "DOCUMENT"
                })
              } else {
                context.push({
                  excerpt: resultItem.DocumentExcerpt?.Text ?? "",
                  title: resultItem.DocumentTitle?.Text ?? "",
                  content: resultItem.DocumentURI ?? "",
                  type: "DOCUMENT"
                })
              }
              ci++
            }
            if (ci > 3) { break }
          }
        }
        // R-7. AI へリクエスト
        await inference({
          userUtterance: currentInputText,
          history: [],
          documents: context
        }).then(data => {
          // R-8. AI のレスポンスを表示
          setCurrentConversation({
            conversationType: "HUMAN_KENDRA_AI",
            userInput: { word: currentInputText },
            userQuery: undefined,
            aiResponse: {
              userUtterance: currentInputText,
              aiUtterance: data,
              actualPrompt: "",
              memory: undefined,
              usedTemplatePrompt: "",
              contexts: context,
              llmParam: {}
            },
            kendraResponse: kendraResponse ?? undefined
          })
        }).catch(err => {
          console.log(err)
          toast({
            title: t("toast.fail_kendra"),
            description: "",
            status: 'error',
            duration: 1000,
            isClosable: true,
          })
        })

      }
      run()
    } else if (currentSearchMode === "#ai") {
      /* AI へのリクエスト
       *
       * A-1. History に追加
       * A-2. フィルタをリセット
       * A-3. 考え中の表示
       * A-4. AI へのリクエスト
       * A-5. AI からのレスポンスを表示
       */

      // A-1. History に追加
      if (currentConversation !== undefined) {
        setHistory([currentConversation, ...history])
        setCurrentConversation(undefined)
      }
      // A-2. フィルタをリセット
      setFilterOptions([
        filterOptions[0], // 言語設定
        filterOptions[1], // ソート順序
      ])
      // A-3. 考え中の表示
      setCurrentConversation({
        conversationType: "HUMAN_AI",
        userInput: { word: currentInputText },
        userQuery: undefined,
        aiResponse: {
          userUtterance: currentInputText,
          aiUtterance: "考え中...",
          actualPrompt: "",
          memory: undefined,
          usedTemplatePrompt: "",
          contexts: [],
          llmParam: {}
        },
        kendraResponse: undefined
      })

      const run = async () => {
        // ピン止めされたテキストをコンテキストとして食わせる
        const context: DocumentForInf[] = []
        pinnedTexts.forEach((p) => {
          context.push({
            excerpt: p,
            title: "",
            content: "",
            type: "DOCUMENT"
          })
        })
        // A-4. AI へのリクエスト
        await inference({
          userUtterance: currentInputText,
          history: [],
          documents: context
        }).then(data => {
          // A-5. AI からのレスポンスを表示
          setCurrentConversation({
            conversationType: "HUMAN_AI",
            userInput: { word: currentInputText },
            userQuery: undefined,
            aiResponse: {
              userUtterance: currentInputText,
              aiUtterance: data,
              actualPrompt: "",
              memory: undefined,
              usedTemplatePrompt: "",
              contexts: [],
              llmParam: {}
            },
            kendraResponse: undefined
          })
        }).catch(err => {
          console.log(err)
          toast({
            title: t("toast.fail_kendra"),
            description: "",
            status: 'error',
            duration: 1000,
            isClosable: true,
          })
        })
      }
      run()
    }
  }

  return (
    <Flex
      as="header"
      position="fixed"
      w="100vw"
      minH="10vh"
      bg="white"
      py={{ base: 2 }}
      px={{ base: 4 }}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      align={'center'}
      zIndex={1}
      top={0}>
      {/* タイトル */}
      <Flex width={"100%"}>
        <Text fontSize="2xl" fontWeight="bold">
          Amazon Kendra
        </Text>
      </Flex>

      {/* 検索バー */}
      <Flex>
        <InputGroup size='md' w="60vw">
          <InputLeftAddon>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {currentSearchMode}
              </MenuButton>
              <MenuList>
                {
                  SEARCH_MODE_LIST.map((item: string) => {
                    return (<MenuItem onClick={() => setCurrentSearchMode(item)} key={item}>{item}</MenuItem>)
                  })
                }
              </MenuList>
            </Menu>
          </InputLeftAddon>
          <Input placeholder={t("top_bar.search")} value={currentInputText} onChange={(e) => setCurrentInputText(e.target.value)} onKeyDown={handleKeyDown} autoComplete='on' list='mylist' />
          <datalist id="mylist">
          </datalist>
        </InputGroup>
      </Flex>

      {/* アカウントの設定 */}
      <HStack display={"flex"} justifyContent={"flex-end"} width={"100%"}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {t("top_bar.account")}
          </MenuButton>
          <MenuList>
            {/* MFAボタン */}
            <CustomSetupTOTP user={user} issuer="jp-rag-sample" handleAuthStateChange={() => null}></CustomSetupTOTP>
            {/* ログアウトボタン */}
            <MenuItem onClick={logout}>{t("top_bar.logout")}</MenuItem>
          </MenuList>
        </Menu>

        {/* ピン機能 */}
        <IconButton icon={<AiOutlinePushpin />} backgroundColor={"transparent"} onClick={onOpen} aria-label="show-pinned-texts" />
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth='1px'>{t("right_side_bar.pinned_text")}</DrawerHeader>
            <DrawerBody>
              {
                pinnedTexts.map((item: string, idx: number) => (
                  (() => {

                    return (<HStack key={idx}>
                      <IconButton icon={<AiOutlineDelete />} backgroundColor={"transparent"} onClick={() => {
                        const tmpSelected: string[] = pinnedTexts
                        tmpSelected.splice(idx, 1)
                        setFilterOptions([...filterOptions])
                      }} aria-label="show-pinned-texts" />
                      <Text>{item}</Text>
                    </HStack>)
                  })()
                ))
              }
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </HStack>

    </Flex>
  );
}