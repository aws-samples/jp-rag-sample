// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import {
  Flex,
  Text,
  useColorModeValue,
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
import { CustomSetupTOTP } from './TOTP.tsx'
import { AiOutlinePushpin, AiOutlineDelete } from 'react-icons/ai';
import { useGlobalContext } from '../App';
import { UseAuthenticator } from '@aws-amplify/ui-react-core';
import { AmplifyUser } from '@aws-amplify/ui';
// i18
import { useTranslation } from "react-i18next";
import InputWithSuggest from './InputWithSuggest.tsx';

export type SignOut = UseAuthenticator['signOut'];


export default function TopBar({ logout, user }: { logout: SignOut | undefined, user: AmplifyUser | undefined },) {
  // 言語設定
  const { t } = useTranslation();

  // 画面上部の検索バー
  const {
    filterOptions: filterOptions,
    setFilterOptions: setFilterOptions,
    pinnedTexts: pinnedTexts,

  } = useGlobalContext();

  const { isOpen, onOpen, onClose } = useDisclosure()

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
      zIndex={1}
      top={0}>
      {/* タイトル */}
      <Flex width={"100%"}>
        <Text fontSize="2xl" fontWeight="bold">
          Amazon Kendra
        </Text>
      </Flex>

      {/* 検索バー */}
      <Flex>
        <InputWithSuggest/>
      </Flex>

      {/* アカウントの設定 */}
      <HStack display={"flex"} justifyContent={"flex-end"} width={"100%"}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {t("top_bar.account")}
          </MenuButton>
          <MenuList>
            {/* MFAボタン */}
            <CustomSetupTOTP user={user} issuer="jp-rag-sample" handleAuthStateChange={() => null}></CustomSetupTOTP>
            {/* ログアウトボタン */}
            <MenuItem onClick={logout}>{t("top_bar.logout")}</MenuItem>
          </MenuList>
        </Menu>

        {/* ピン機能 */}
        <IconButton icon={<AiOutlinePushpin />} backgroundColor={"transparent"} onClick={onOpen} aria-label="show-pinned-texts" />
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth='1px'>{t("right_side_bar.pinned_text")}</DrawerHeader>
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