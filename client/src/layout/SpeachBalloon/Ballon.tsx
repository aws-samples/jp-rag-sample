import { ReactNode } from 'react';
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/Ai";
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
                            console.log("[DEBUG] -1 called")
                        } else {
                            console.log(`[DEBUG] ${bid} called`)
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