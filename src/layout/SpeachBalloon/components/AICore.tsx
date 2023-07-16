// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { Avatar, Box, HStack, Heading, VStack } from "@chakra-ui/react";
import { AiFillRobot } from "react-icons/ai";
import { AiResponse } from "../../../utils/interface";
import QuotedTexts from "./QuotedTexts";

const AICore: React.FC<{ data: AiResponse }> = ({ data }) => {
  // AIのCore部品
  // AIモードとRAGモードの際に表示
  // AI.tsxとKendra.tsxから参照
  return (
    <Box>
      <HStack minH='10vh' p='10px'>
        {/* AI の黄色いアイコン */}
        <Avatar bg='yellow.500' icon={<AiFillRobot fontSize='1.5rem' />} />
        <VStack align="start" w="85vw">
          <Heading size="sm">
            AI の回答
          </Heading>
          {/* AIからの出力結果を表示 */}
          <Box>
            <QuotedTexts fulltext={data.aiUtterance} contexts={data.contexts} />
          </Box>
        </VStack>
      </HStack>
    </Box>
  )
};
export default AICore;