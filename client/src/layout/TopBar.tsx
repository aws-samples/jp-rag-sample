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
    HStack,
    IconButton,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    useDisclosure,
} from '@chakra-ui/react';
import {
    ChevronDownIcon
} from '@chakra-ui/icons';
import { useState } from 'react';
import { AiOutlinePushpin, AiOutlineDelete } from 'react-icons/Ai';
import { useGlobalContext } from '../App';

export default function TopBar() {
    const {
        filterOptions: filterOptions,
        setFilterOptions: setFilterOptions,
        pinnedTexts: pinnedTexts,
    } = useGlobalContext();

    const [text, setText] = useState("");
    const [searchMode, setSearchMode] = useState("#RAG");
    const { isOpen, onOpen, onClose } = useDisclosure()

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
            <Flex width={"100%"}>
                <Text fontSize="2xl" fontWeight="bold">
                    Amazon Kendra
                </Text>
            </Flex>
            <Flex>
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
            <HStack display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                <IconButton icon={<AiOutlinePushpin />} backgroundColor={"transparent"} onClick={onOpen} aria-label="show-pinned-texts" />
                <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth='1px'>ピン止めされたテキスト</DrawerHeader>
                        <DrawerBody>
                            {
                                pinnedTexts.map((item: string, idx: number) => (
                                    (() => {

                                        return (<HStack key={idx}>
                                            <IconButton icon={<AiOutlineDelete />} backgroundColor={"transparent"} onClick={() => {
                                                const tmpSelected: string[] = pinnedTexts
                                                tmpSelected.splice(idx, 1)
                                                setFilterOptions([...filterOptions])
                                            }} aria-label="show-pinned-texts" />
                                            <Text>{item}</Text>
                                        </HStack>)
                                    })()
                                ))
                            }
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </HStack>

        </Flex>
    );
}