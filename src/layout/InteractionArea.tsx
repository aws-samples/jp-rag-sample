import { Flex, StackDivider, VStack } from "@chakra-ui/layout"
import { useGlobalContext } from '../App';
import Human from './SpeachBalloon/Human';
import Ballon from './SpeachBalloon/Ballon';
import AI from './SpeachBalloon/AI';
import Kendra from './SpeachBalloon/Kendra';
import { useEffect } from "react";
import { Conversation } from "../utils/interface";

const InteractionArea = () => {
    const {
        history: history,
        setHistory: setHistory,
    } = useGlobalContext();

    return (
        <Flex>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                w="85vw"
                align='stretch'
            >
                {
                    history.map((h: Conversation, idx: number) => (
                        (() => {
                            if (h.conversationType === "HUMAN") {
                                {/* 人間 */ }
                                return (
                                    <Ballon text={h.userInput.word} key={idx}>
                                        <Human data={h} />
                                    </Ballon>
                                )
                            } else if (h.conversationType === "HUMAN_AI") {
                                {/* AI */ }
                                return (
                                    <Ballon text={h.userInput.word} key={idx}>
                                        <AI data={h} />
                                    </Ballon>
                                )
                            } else if (h.conversationType === "HUMAN_KENDRA" || h.conversationType === "HUMAN_KENDRA_AI") {
                                {/* Kendra */ }
                                return (
                                    <Ballon text={h.userInput.word} key={idx}>
                                        <Kendra data={h}></Kendra>
                                    </Ballon>
                                )
                            }
                            return (<></>)
                        })()
                    ))
                }

            </VStack>
        </Flex>
    )
}
export default InteractionArea;