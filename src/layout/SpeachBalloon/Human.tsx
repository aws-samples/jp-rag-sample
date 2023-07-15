// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { Avatar, Box, HStack, Heading, VStack, useToast } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";
import { Conversation } from "../../utils/interface";
import { useGlobalContext } from "../../App";

const Human: React.FC<{ data: Conversation }> = ({ data }) => {
    // 人の入力文字の吹き出し


    const {
        pinnedTexts: pinnedTexts,
        setPinnedTexts: setPinnedTexts,
    } = useGlobalContext();

    const toast = useToast()

    return (
        <Box>
            <HStack minH='10vh' p='10px'>
                <Avatar bg='red.300' icon={<AiOutlineUser fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                    <Heading size="sm">あなた</Heading>
                    <Box onClick={() => {
                        setPinnedTexts([...pinnedTexts, data.userInput.word ?? "読み込みエラー"])
                        toast({
                            title: 'テキストがピン止めされました',
                            description: "",
                            status: 'success',
                            duration: 1000,
                            isClosable: true,
                        })
                    }}>{data.userInput.word}</Box>
                </VStack>
            </HStack>
        </Box>
    )
};
export default Human;