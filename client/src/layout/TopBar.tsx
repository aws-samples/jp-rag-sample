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
} from '@chakra-ui/react';
import {
    ChevronDownIcon
} from '@chakra-ui/icons';
import { useState } from 'react';
import { AiOutlinePushpin, AiOutlineDelete } from 'react-icons/Ai';
import { useGlobalContext } from '../App';
import { serverUrl } from '../services/AWS';


export default function TopBar() {
    const {
        filterOptions: filterOptions,
        setFilterOptions: setFilterOptions,
        pinnedTexts: pinnedTexts,
        currentConversation: currentConversation,
        setCurrentConversation: setCurrentConversation,
    } = useGlobalContext();

    const [text, setText] = useState("");
    const [searchMode, setSearchMode] = useState("#RAG");
    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return

        if (text === "#rag") {
            setSearchMode("#rag")
            setText("")
            return
        } else if (text === "#kendra") {
            setSearchMode("#kendra")
            setText("")
            return
        } else if (text === "#ai") {
            setSearchMode("#ai")
            setText("")
            return
        }

        async function postData(url = '', data = {}) {
            const r = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            return await r.json()
        }

        // example usage:
        if (searchMode === "#kendra") {
            postData(`${serverUrl}/v1/query`, {
                "query": "string",
                "user_id": text,
                "query_type": "kendra"
            })
                .then(data => {
                    const tmpDocResults =[]
                    for (let r of data.results) {
                        tmpDocResults.push(
                            {
                              "AdditionalAttributes": [],
                              "DocumentAttributes": [
                                {
                                  "Key": "_source_uri",
                                  "Value": {
                                    "StringValue": r.metadata.source
                                  }
                                }
                              ],
                              "DocumentExcerpt": {
                                "Highlights": [
                                  ],
                                  "Text": r.page_content
                              },
                              "DocumentId": r.metadata.source,
                              "DocumentTitle": {
                                "Highlights": [],
                                "Text": r.metadata.title
                              },
                              "DocumentURI": r.metadata.source,
                              "FeedbackToken": r.metadata.feedback_token,
                              "Format": "TEXT",
                              "Id": r.metadata.source,
                              "ScoreAttributes": {
                                "ScoreConfidence": "MEDIUM"
                              },
                              "Type": "DOCUMENT"
                            })
                    }
                    setCurrentConversation({
                        conversationType: "HUMAN_KENDRA",
                        userInput: {word: text},
                        userQuery: {
                            IndexId: "indexId",
                            PageNumber: 1,
                            PageSize: 10,
                            QueryText: "首相",
                            AttributeFilter: {
                              AndAllFilters: [
                                {
                                  EqualsTo: {
                                    Key: "_language_code",
                                    Value: {
                                      "StringValue": "ja"
                                    }
                                  }
                                }
                              ]
                            }
                          },
                        kendraResponse: {
                            "$metadata": {
                              "httpStatusCode": 200,
                              "requestId": "f4bb9924-424e-4a13-a0ff-ed8330054210",
                              "attempts": 1,
                              "totalRetryDelay": 0
                            },
                            "FacetResults": [
                              {
                                "DocumentAttributeKey": "_data_source_id",
                                "DocumentAttributeValueCountPairs": [
                                  {
                                    "Count": 163,
                                    "DocumentAttributeValue": {
                                      "StringValue": "68ce80bd-df1a-45ca-b096-fcb5add21a72"
                                    }
                                  },
                                  {
                                    "Count": 3,
                                    "DocumentAttributeValue": {
                                      "StringValue": "69d50512-bf7b-43e8-a3a1-58c0064d5fcf"
                                    }
                                  }
                                ],
                                "DocumentAttributeValueType": "STRING_VALUE"
                              }
                            ],
                            "FeaturedResultsItems": [],
                            "QueryId": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9",
                            "ResultItems": tmpDocResults,
                            "TotalNumberOfResults": 170
                          },
                        aiResponse: undefined
                    })
                });

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
                                {searchMode}
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => setSearchMode("#rag")}>rag</MenuItem>
                                <MenuItem onClick={() => setSearchMode("#kendra")}>kendra</MenuItem>
                                <MenuItem onClick={() => setSearchMode("#ai")}>ai</MenuItem>
                            </MenuList>
                        </Menu>
                    </InputLeftAddon>
                    <Input placeholder='検索' value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} autoComplete='on' list='mylist' />
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