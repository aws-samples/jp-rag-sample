import {
    Input,
    Flex,
    Text,
    useColorModeValue,
    InputGroup,
    InputLeftAddon,
    Button,
    MenuButton,
    Menu,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import {
    ChevronDownIcon
} from '@chakra-ui/icons';
import { useState } from 'react';

export default function TopBar() {
    const [text, setText] = useState("");
    const [searchMode, setSearchMode] = useState("#RAG");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return

        if (text === "#rag") {
            setSearchMode("#rag")
            setText("")
            return
        } else if (text === "#kendra") {
            setSearchMode("#kendra")
            setText("")
            return
        } else if (text === "#ai") {
            setSearchMode("#ai")
            setText("")
            return
        }
    }

    return (
        <Flex
            as="header"
            position="fixed"
            w="100vw"
            minH="10vh"
            bg="white"
            py={{ base: 2 }}
            px={{ base: 4 }}
            borderBottom={1}
            borderStyle={'solid'}
            borderColor={useColorModeValue('gray.200', 'gray.900')}
            align={'center'}
            zIndex={1}>
            <Flex>
                <Text fontSize="2xl" fontWeight="bold">
                    Amazon Kendra
                </Text>
            </Flex>
            <Flex pl='30px'>
                <InputGroup size='md' w="60vw">
                    <InputLeftAddon>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                {searchMode}
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => setSearchMode("#rag")}>rag</MenuItem>
                                <MenuItem onClick={() => setSearchMode("#kendra")}>kendra</MenuItem>
                                <MenuItem onClick={() => setSearchMode("#ai")}>ai</MenuItem>
                            </MenuList>
                        </Menu>
                    </InputLeftAddon>
                    <Input placeholder='検索' value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} autoComplete='on' list='mylist' />
                    <datalist id="mylist">
                        <option value="Kendra"></option>
                        <option value="Lex"></option>
                        <option value="SageMaker"></option>
                        <option value="EC2"></option>
                        <option value="Lambda"></option>
                    </datalist>
                </InputGroup>
            </Flex>
        </Flex>
    );
}