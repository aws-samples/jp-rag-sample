// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { ReactNode } from 'react';
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import { useGlobalContext } from '../../App';
// i18
import { useTranslation } from "react-i18next";

const Ballon: React.FC<{ bid: number, text: string, children: ReactNode, }> = ({ bid, text, children }) => {
    // 言語設定
    const { t } = useTranslation();

    // 入力したクエリ文字と各種吹き出しを表示するコンポーネント
    const {
        setCurrentConversation: setCurrentConversation,
        history: history,
        setHistory: setHistory,
    } = useGlobalContext();

    return (
        <>
            {/* 入力したクエリ文字 */}
            <Box>
                <HStack h='3vh' p='10px'>
                    <IconButton aria-label='Search database' icon={<AiOutlineDelete />} backgroundColor={"transparent"} onClick={() => {
                        if (bid === -1) {
                            setCurrentConversation(undefined)
                        } else {
                            history.splice(bid, 1)
                            setHistory([...history])
                        }
                    }} />
                    <Text>{t("body.query")}: {text}</Text>
                </HStack>
            </Box>

            {/* 吹き出し */}
            {children}
        </>
    )
};
export default Ballon;