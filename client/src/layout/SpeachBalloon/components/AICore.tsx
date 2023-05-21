import ace from 'ace-builds';
ace.config.set('basePath', 'ace-builds/src-noconflict');
import "ace-builds/src-noconflict/theme-github";
import AceEditor from "react-ace";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Avatar, Box, HStack, Heading, IconButton, VStack } from "@chakra-ui/react";
import { AiFillRobot, AiOutlineReload } from "react-icons/Ai";
import { AiResponse } from "../../../utils/interface";

const AICore: React.FC<{ data: AiResponse }> = ({ data }) => {
    return (
        <Box>
        <HStack minH='10vh' p='10px'>
          <Avatar bg='yellow.500' icon={<AiFillRobot fontSize='1.5rem' />} />
          <VStack align="start" w="85vw">
            <Heading size="sm">
              AI
            </Heading>
            <Box>{data.aiUtterance}</Box>
            <Accordion defaultIndex={[-1]} allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex='1' textAlign='left'>
                      prompt
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <AceEditor
                    theme="github"
                    mode="text"
                    value={data.actualPrompt}
                    minLines={10}
                    maxLines={10}
                  />

                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
          <IconButton aria-label='Search database' icon={<AiOutlineReload />} />
        </HStack>
      </Box>
    )
};
export default AICore;