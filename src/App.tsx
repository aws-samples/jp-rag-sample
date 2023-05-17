
import { useState } from "react";
import AceEditor from "react-ace";
import WithSubnavigation from "./navbar.tsx"
import SimpleSidebar from './sidebar.tsx'
import { Box, Flex, HStack, Heading, StackDivider, Text, VStack } from "@chakra-ui/layout"
import { Avatar } from "@chakra-ui/avatar"
import {
  AiOutlineFileSearch,
  AiOutlineUser,
  AiFillRobot,
  AiOutlineDislike,
  AiOutlineLike,
  AiOutlineLine,
  AiOutlineReload,
  AiOutlineDelete,
  AiOutlinePushpin
} from "react-icons/Ai";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import { IconButton } from "@chakra-ui/button";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from "@chakra-ui/accordion";
import { Button } from "@chakra-ui/react";

function App() {
  const [_1IsActive, set_1IsActive] = useState(true);

  return (
    <>
      <WithSubnavigation />
      <SimpleSidebar>
        <Flex>
          <VStack
            divider={<StackDivider borderColor='gray.200' />}
            w="85vw"
            align='stretch'
          >
            <Box>
              <HStack h='3vh' p='10px'>
                <IconButton aria-label='Search database' icon={<AiOutlineDelete />} backgroundColor={"transparent"} />
                <Text>入力: amazon kendra</Text>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='yellow.500' icon={<AiFillRobot fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    AI
                  </Heading>
                  <Box>Amazon Kendra は、エンタープライズ検索です。</Box>
                  <Accordion defaultIndex={[-1]} allowMultiple>
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex='1' textAlign='left'>
                            prompt
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <AceEditor
                          theme="github"
                          // value={}
                          minLines={10}
                          maxLines={10}
                        />

                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
                <IconButton aria-label='Search database' icon={<AiOutlineReload />} />
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px' bg={_1IsActive ? "white" : "yellow.100"}>
                {_1IsActive
                  ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} onClick={() => set_1IsActive(false)} />
                  : <Avatar bg='green.500' icon={<AiOutlinePushpin fontSize='1.5rem' />} onClick={() => set_1IsActive(true)} />
                }

                <VStack align="start" w="85vw">
                  <Tabs variant={"enclosed"} colorScheme='green'>
                    <TabList>
                      <Tab>固定の文章1</Tab>
                      <Tab>固定の文章2</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <Heading size="sm">
                          <a href="#">
                            Amazon Kendra - エンタープライズ検索エンジン
                          </a>
                        </Heading>
                        <Box>Amazon Kendra は、ユーザーが組み込みコネクタを使用してさまざまなコンテンツリポジトリを検索できるようにするインテリジェントなエンタープライズ検索サービスです ...</Box>
                      </TabPanel>
                      <TabPanel>
                        <Heading size="sm">
                          <a href="#">
                            Amazon Kendra - エンタープライズ検索エンジン
                          </a>
                        </Heading>
                        <Box>Amazon Kendra は、ユーザーが組み込みコネクタを使用してさまざまなコンテンツリポジトリを検索できるようにするインテリジェントなエンタープライズ検索サービスです ...</Box>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                  <Tabs variant={"enclosed"} colorScheme='green'>
                    <TabList>
                      <Tab>FAQ1</Tab>
                      <Tab>FAQ2</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <HStack>
                          <VStack mt="5">
                            <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                            <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                          </VStack>
                          <VStack align={"left"}>
                            <Heading size="sm">
                              <a href="#">
                                FAQ: 質問、質問、質問1
                              </a>
                            </Heading>
                            <Box>答え答え答え答え答え答え答え答え答え答え答え答え</Box>
                          </VStack>
                        </HStack>
                      </TabPanel>
                      <TabPanel>
                        <HStack>
                          <VStack mt="5">
                            <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                            <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                          </VStack>
                          <VStack align={"left"}>
                            <Heading size="sm">
                              <a href="#">
                                FAQ: 質問、質問、質問2
                              </a>
                            </Heading>
                            <Box>答え答え答え答え答え答え答え答え答え答え答え答え</Box>
                          </VStack>
                        </HStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                  <Tabs variant={"enclosed"} colorScheme='green'>
                    <TabList>
                      <Tab>抜粋1</Tab>
                      <Tab>抜粋2</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>

                        <HStack>
                          <VStack mt="5">
                            <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                            <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                          </VStack>
                          <VStack align={"left"}>
                            <Heading size="sm">
                              <a href="#">
                                抜粋1
                              </a>
                            </Heading>
                            <Box>答え答え答え答え答え答え答え答え答え答え答え答え</Box>
                          </VStack>
                        </HStack>
                      </TabPanel>
                      <TabPanel>
                        <HStack>
                          <VStack mt="5">
                            <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                            <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                          </VStack>
                          <VStack align={"left"}>
                            <Heading size="sm">
                              <a href="#">
                                抜粋2
                              </a>
                            </Heading>
                            <Box>答え答え答え答え答え答え答え答え答え答え答え答え</Box>
                          </VStack>
                        </HStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      Amazon Kendra - エンタープライズ検索エンジン
                    </a>
                  </Heading>
                  <Box>Amazon Kendra は、ユーザーが組み込みコネクタを使用してさまざまなコンテンツリポジトリを検索できるようにするインテリジェントなエンタープライズ検索サービスです ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                {false
                  ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                  : <Avatar bg='green.500' icon={<AiOutlineLine fontSize='1.5rem' />} />
                }
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      Amazon Kendra を触ってみた
                    </a>
                  </Heading>
                  <Box>Amazon Kendra は、様々なデータソースを横断的に検索できるエンタープライズ検索サービスです。Kendra から各種データソースに簡単に接続できる ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                {false
                  ? <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                  : <Avatar bg='green.500' icon={<AiOutlineLine fontSize='1.5rem' />} />
                }
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      [アップデート]Amazon Kendraが東京リージョンにやってき ...
                    </a>
                  </Heading>
                  <Box>Amazon Kendraは、機械学習を原動力とした、高精度で使いやすいエンタープライズ検索サービスです。 検索対象として、さまざまなファイル形式・データソースの利用が ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack h='3vh' p='10px'>
                <Button colorScheme='teal' variant='link'>
                  次の3件を表示...
                </Button>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='red.300' icon={<AiOutlineUser fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                  <Heading size="sm">あなた</Heading>
                  <Box>amazon kendra</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack h='3vh' p='10px'>
                <IconButton aria-label='Search database' icon={<AiOutlineDelete />} backgroundColor={"transparent"} />
                <Text>入力: amazon kendra</Text>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      Amazon Kendra - エンタープライズ検索エンジン
                    </a>
                  </Heading>
                  <Box>Amazon Kendra は、ユーザーが組み込みコネクタを使用してさまざまなコンテンツリポジトリを検索できるようにするインテリジェントなエンタープライズ検索サービスです ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      Amazon Kendra を触ってみた
                    </a>
                  </Heading>
                  <Box>Amazon Kendra は、様々なデータソースを横断的に検索できるエンタープライズ検索サービスです。Kendra から各種データソースに簡単に接続できる ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='green.500' icon={<AiOutlineFileSearch fontSize='1.5rem' />} />
                <VStack mt="5">
                  <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} />
                  <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} />
                </VStack>
                <VStack align="start" w="85vw">
                  <Heading size="sm">
                    <a href="#">
                      [アップデート]Amazon Kendraが東京リージョンにやってき ...
                    </a>
                  </Heading>
                  <Box>Amazon Kendraは、機械学習を原動力とした、高精度で使いやすいエンタープライズ検索サービスです。 検索対象として、さまざまなファイル形式・データソースの利用が ...</Box>
                </VStack>
              </HStack>
            </Box>
            <Box>
              <HStack h='3vh' p='10px'>
                <Button colorScheme='teal' variant='link'>
                  次の3件を表示...
                </Button>
              </HStack>
            </Box>
            <Box>
              <HStack minH='10vh' p='10px'>
                <Avatar bg='red.300' icon={<AiOutlineUser fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                  <Heading size="sm">あなた</Heading>
                  <Box>amazon kendra</Box>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </Flex>
      </SimpleSidebar>
    </>
  )
}

export default App
