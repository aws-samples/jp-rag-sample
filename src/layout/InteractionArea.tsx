// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Flex, StackDivider, VStack } from "@chakra-ui/layout"
import { useGlobalContext } from '../App';
import Human from './SpeachBalloon/Human';
import Ballon from './SpeachBalloon/Ballon';
import AI from './SpeachBalloon/AI';
import Kendra from './SpeachBalloon/Kendra';

const InteractionArea = () => {
    // 画面中央の表示


    const {
        currentConversation: currentConversation,
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
            </VStack>
        </Flex>
    )
}
export default InteractionArea;