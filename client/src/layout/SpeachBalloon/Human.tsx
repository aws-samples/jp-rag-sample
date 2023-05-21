import { Avatar, Box, HStack, Heading, VStack } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/Ai";
import { Conversation } from "../../utils/interface";

const Human: React.FC<{data: Conversation}> = ({ data }) => {
    return (
        <Box>
            <HStack minH='10vh' p='10px'>
                <Avatar bg='red.300' icon={<AiOutlineUser fontSize='1.5rem' />} />
                <VStack align="start" w="85vw">
                    <Heading size="sm">あなた</Heading>
                    <Box>{data.userInput.word}</Box>
                </VStack>
            </HStack>
        </Box>
    )
};
export default Human;