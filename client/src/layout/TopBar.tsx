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
import { AiOutlinePushpin, AiOutlineDelete } from 'react-icons/Ai';
import { useGlobalContext } from '../App';
import { getKendraQuery, kendraQuery, serverUrl } from '../services/AWS';
import { SEARCH_MODE_LIST } from '../utils/constant';
import { getAttributeFilter, getCurrentSortOrder, getFiltersFromQuery, postData } from '../utils/function';
import { Conversation } from '../utils/interface';


export default function TopBar() {
  const {
    currentConversation: currentConversation,
    setCurrentConversation: setCurrentConversation,
    history: history,
    setHistory: setHistory,
    filterOptions: filterOptions,
    setFilterOptions: setFilterOptions,
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
       * K-2. 現在設定中のfilterは見ずに、言語設定とソート順序だけを反映させてKendraへQuery
       * K-3. 受け取ったレスポンスを元にInteractionAreaを描画
       * K-4. Query結果からフィルタ候補を取得
       * K-5. FilterBarの設定とソート順序以外を更新
       */

      // K-1. 今 Interaction Areaに何かが表示されている場合は、historyに退避
      if (currentConversation !== undefined) {
        setHistory([currentConversation, ...history])
        setCurrentConversation(undefined)
      }
      // K-2. 現在設定中のfilterは見ずに、言語設定とソート順序だけを反映させてKendraへQuery
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
            // K-3. 受け取ったレスポンスを元にInteractionAreaを描画
            setCurrentConversation(a)
            // K-4. Query結果からフィルタ候補を取得
            // K-5. FilterBarの設定とソート順序以外を更新
            if (data) { 
              setFilterOptions([
                filterOptions[0], // 言語設定
                filterOptions[1], // ソート順序
                ...getFiltersFromQuery(data)]) // クエリから受け取ったフィルタ候補
             }
          }).catch(err => {
            console.log(err)
            toast({
              title: 'エラー (kendraへの問い合わせに失敗しました)',
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
       */
      // 考え中の表示
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
          promptVariables: {},
          llmParam: {}
        },
        kendraResponse: undefined
      })
      // rag API へのリクエスト
      postData(`${serverUrl}/v1/query`, {
        "query": currentInputText,
        "user_id": "string",
        "query_type": "llm"
      })
        .then(data => {
          console.log(data)
          const tmpDocResults = []
          for (let sd of data.source_documents) {
            tmpDocResults.push(
              {
                "AdditionalAttributes": [],
                "DocumentAttributes": [
                  {
                    "Key": "_source_uri",
                    "Value": {
                      "StringValue": sd.metadata.source
                    }
                  }
                ],
                "DocumentExcerpt": {
                  "Highlights": [
                  ],
                  "Text": sd.metadata.excerpt
                },
                "DocumentId": sd.metadata.source,
                "DocumentTitle": {
                  "Highlights": [],
                  "Text": sd.metadata.title
                },
                "DocumentURI": sd.metadata.source,
                "FeedbackToken": sd.metadata.feedback_token,
                "Format": "TEXT",
                "Id": sd.metadata.source,
                "ScoreAttributes": {
                  "ScoreConfidence": "MEDIUM"
                },
                "Type": "DOCUMENT"
              })
          }
          // 表示変更
          setCurrentConversation({
            conversationType: "HUMAN_KENDRA_AI",
            userInput: { word: currentInputText },
            userQuery: undefined,
            aiResponse: {
              userUtterance: currentInputText,
              aiUtterance: data.answer,
              actualPrompt: "",
              memory: undefined,
              usedTemplatePrompt: "",
              promptVariables: {},
              llmParam: {}
            },
            kendraResponse: {
              "$metadata": {
                "httpStatusCode": 200,
                "requestId": "f4bb9924-424e-4a13-a0ff-ed8330054210",
                "attempts": 1,
                "totalRetryDelay": 0
              },
              "FacetResults": [],
              "FacetResultsItem": [],
              "QueryId": "",
              "ResultItems": tmpDocResults,
              "TotalNumberOfResults": tmpDocResults.length
            }
          })
        });
    } else if (currentSearchMode === "#ai") {
      toast({
        title: '工事中',
        description: "",
        status: 'error',
        duration: 1000,
        isClosable: true,
      })
    } else if (currentSearchMode === "#historycalrag") {
      toast({
        title: '工事中',
        description: "",
        status: 'error',
        duration: 1000,
        isClosable: true,
      })
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
      zIndex={1}>
      <Flex width={"100%"}>
        <Text fontSize="2xl" fontWeight="bold">
          Amazon Kendra
        </Text>
      </Flex>
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
          <Input placeholder='検索' value={currentInputText} onChange={(e) => setCurrentInputText(e.target.value)} onKeyDown={handleKeyDown} autoComplete='on' list='mylist' />
          <datalist id="mylist">
            <option value="Kendra"></option>
            <option value="Lex"></option>
            <option value="SageMaker"></option>
            <option value="EC2"></option>
            <option value="Lambda"></option>
          </datalist>
        </InputGroup>
      </Flex>
      <HStack display={"flex"} justifyContent={"flex-end"} width={"100%"}>
        <IconButton icon={<AiOutlinePushpin />} backgroundColor={"transparent"} onClick={onOpen} aria-label="show-pinned-texts" />
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth='1px'>ピン止めされたテキスト</DrawerHeader>
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