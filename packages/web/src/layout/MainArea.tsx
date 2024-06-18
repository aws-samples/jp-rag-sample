// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Flex } from '@chakra-ui/react';
import FilterArea from './FilterArea';
import { VStack } from '@chakra-ui/layout';
import { useGlobalContext } from '../utils/useGlobalContext';
import Kendra from './KendraAreaAssets/KendraAreaMain';
import { HStack } from '@chakra-ui/react';
// i18
import AiArea from './AiArea';

const MainArea = () => {
  const { currentConversation: currentConversation } = useGlobalContext();

  return (
    <HStack
      h="92vh"
      mt="10vh"
      align="start"
      minWidth="1250px"
      overflowX="scroll">
      {/* フィルター */}
      <FilterArea />

      {/* 本体 */}
      <Flex w="55%" h="92vh">
        <VStack align="stretch">
          {(() => {
            if (currentConversation !== undefined) {
              return <Kendra data={currentConversation}></Kendra>;
            }
            return <></>;
          })()}
        </VStack>
      </Flex>

      {/* AI */}
      <AiArea />
    </HStack>
  );
};

export default MainArea;
