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
} from '@chakra-ui/react';
import {
  ChevronDownIcon
} from '@chakra-ui/icons';
import { CustomSetupTOTP } from './TOTP.tsx'
import { UseAuthenticator } from '@aws-amplify/ui-react-core';
import { AmplifyUser } from '@aws-amplify/ui';
// i18
import { useTranslation } from "react-i18next";
import InputWithSuggest from './InputWithSuggest.tsx';

export type SignOut = UseAuthenticator['signOut'];


export default function TopBar({ logout, user }: { logout: SignOut | undefined, user: AmplifyUser | undefined },) {
  // 言語設定
  const { t } = useTranslation();

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
      </HStack>

    </Flex>
  );
}