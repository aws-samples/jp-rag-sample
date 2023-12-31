// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Avatar, Box, HStack, Heading, VStack, useToast } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";
import { Conversation } from "../../utils/interface";
import { useGlobalContext } from "../../App";
// i18
import { useTranslation } from "react-i18next";

const Human: React.FC<{ data: Conversation }> = ({ data }) => {
    // 言語設定
    const { t } = useTranslation();
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
                    <Heading size="sm">{t("body.you")}</Heading>
                    <Box onClick={() => {
                        setPinnedTexts([...pinnedTexts, data.userInput.word ?? "読み込みエラー"])
                        toast({
                            title: t("toast.pinned"),
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