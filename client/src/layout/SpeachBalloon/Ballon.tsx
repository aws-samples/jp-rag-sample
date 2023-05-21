import { ReactNode } from 'react';
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/Ai";

const Ballon: React.FC<{ text: string, children: ReactNode }> = ({ text, children }) => {
    return (
        <>
            <Box>
                <HStack h='3vh' p='10px'>
                    <IconButton aria-label='Search database' icon={<AiOutlineDelete />} backgroundColor={"transparent"} />
                    <Text>入力: {text}</Text>
                </HStack>
            </Box>
            {children}
        </>
    )
};
export default Ballon;