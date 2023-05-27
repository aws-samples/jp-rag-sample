import { Avatar, Box, HStack, Heading, VStack, useToast } from "@chakra-ui/react";
import { AiFillRobot } from "react-icons/Ai";
import { AiResponse } from "../../../utils/interface";
import { useGlobalContext } from '../../../App';

const AICore: React.FC<{ data: AiResponse }> = ({ data }) => {
  const {
    pinnedTexts: pinnedTexts,
    setPinnedTexts: setPinnedTexts,
  } = useGlobalContext();

  const toast = useToast()

  return (
    <Box>
      <HStack minH='10vh' p='10px'>
        <Avatar bg='yellow.500' icon={<AiFillRobot fontSize='1.5rem' />} />
        <VStack align="start" w="85vw">
          <Heading size="sm">
            AI の回答
          </Heading>
          <Box onClick={() => {
            setPinnedTexts([...pinnedTexts, data.aiUtterance ?? "読み込みエラー"])
            toast({
              title: 'テキストがピン止めされました',
              description: "",
              status: 'success',
              duration: 1000,
              isClosable: true,
            })
          }}>{data.aiUtterance}</Box>
        </VStack>
      </HStack>
    </Box>
  )
};
export default AICore;