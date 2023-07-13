// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { ReactNode } from 'react';
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import { useGlobalContext } from '../../App';

const Ballon: React.FC<{  bid: number, text: string, children: ReactNode,}> = ({ bid, text, children }) => {
    const {
        setCurrentConversation: setCurrentConversation,
        history: history,
        setHistory: setHistory,
    } = useGlobalContext();

    return (
        <>
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
                    <Text>クエリ: {text}</Text>
                </HStack>
            </Box>
            {children}
        </>
    )
};
export default Ballon;