import { Flex, StackDivider, VStack } from "@chakra-ui/layout"
import { useGlobalContext } from '../App';
import Human from './SpeachBalloon/Human';
import Ballon from './SpeachBalloon/Ballon';
import AI from './SpeachBalloon/AI';
import Kendra from './SpeachBalloon/Kendra';
import { Conversation } from "../utils/interface";
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box } from '@chakra-ui/react';

const InteractionArea = () => {
    const {
        currentConversation: currentConversation,
        history: history,
    } = useGlobalContext();

    return (
        <Flex>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                w="85vw"
                align='stretch'
            >
                {
                    (() => {
                        if (currentConversation !== undefined) {
                            if (currentConversation.conversationType === "HUMAN") {
                                {/* 人間 */ }
                                return (
                                    <Ballon bid={-1} text={currentConversation.userInput.word}>
                                        <Human data={currentConversation} />
                                    </Ballon>
                                )
                            } else if (currentConversation.conversationType === "HUMAN_AI") {
                                {/* AI */ }
                                return (
                                    <Ballon bid={-1} text={currentConversation.userInput.word}>
                                        <AI data={currentConversation} />
                                    </Ballon>
                                )
                            } else if (currentConversation.conversationType === "HUMAN_KENDRA" || currentConversation.conversationType === "HUMAN_KENDRA_AI") {
                                {/* Kendra */ }
                                return (
                                    <Ballon bid={-1} text={currentConversation.userInput.word}>
                                        <Kendra data={currentConversation}></Kendra>
                                    </Ballon>
                                )
                            }
                        }
                        return (<></>)
                    })()
                }
                <Accordion defaultIndex={[-1]} allowMultiple>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    履歴
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            {
                                history.map((h: Conversation, idx: number) => (
                                    (() => {
                                        if (h.conversationType === "HUMAN") {
                                            {/* 人間 */ }
                                            return (
                                                <Ballon key={idx} bid={idx} text={h.userInput.word}>
                                                    <Human data={h} />
                                                </Ballon>
                                            )
                                        } else if (h.conversationType === "HUMAN_AI") {
                                            {/* AI */ }
                                            return (
                                                <Ballon  key={idx} bid={idx}  text={h.userInput.word}>
                                                    <AI data={h} />
                                                </Ballon>
                                            )
                                        } else if (h.conversationType === "HUMAN_KENDRA" || h.conversationType === "HUMAN_KENDRA_AI") {
                                            {/* Kendra */ }
                                            return (
                                                <Ballon key={idx} bid={idx}  text={h.userInput.word}>
                                                    <Kendra data={h}></Kendra>
                                                </Ballon>
                                            )
                                        }
                                        return (<></>)
                                    })()
                                ))
                            }
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </VStack>
        </Flex>
    )
}
export default InteractionArea;