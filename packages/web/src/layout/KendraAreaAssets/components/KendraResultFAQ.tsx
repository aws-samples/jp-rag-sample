// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import { Box, HStack, Text } from '@chakra-ui/layout';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  useToast,
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/button';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import HighlightedTexts from './HighlightedTexts';
import { QueryResultItem } from '@aws-sdk/client-kendra';
import { Relevance, submitFeedback } from '../../../utils/service';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { getFAQWithHighlight } from '../../../utils/function';
// i18
import { useTranslation } from 'react-i18next';

export const KendraResultFAQ: React.FC<{
  queryId: string | undefined;
  resultItems: QueryResultItem[];
}> = ({ queryId, resultItems }) => {
  // 言語設定
  const { t } = useTranslation();

  const toast = useToast();

  if (queryId !== undefined && resultItems.length > 0) {
    return (
      <Box borderColor="green.500" pb="5">
        <Text p={2}>{t('body.faq')}</Text>

        <Accordion allowMultiple>
          {resultItems.map((resultItem: QueryResultItem, idx: number) => (
            <AccordionItem key={idx}>
              <AccordionButton>
                <Link
                  color="green.500"
                  href={resultItem.DocumentURI}
                  onClick={() => {
                    submitFeedback(
                      Relevance['Click'],
                      resultItem.Id ?? '',
                      queryId
                    );
                  }}
                  isExternal>
                  <HighlightedTexts
                    textWithHighlights={
                      getFAQWithHighlight(
                        resultItem.AdditionalAttributes ?? [],
                        'QuestionText'
                      ) ?? { Highlights: [], Text: '読み込みエラー' }
                    }
                  />
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel>
                <Box>
                  <HighlightedTexts
                    textWithHighlights={
                      getFAQWithHighlight(
                        resultItem.AdditionalAttributes ?? [],
                        'AnswerText'
                      ) ?? { Highlights: [], Text: '読み込みエラー' }
                    }
                  />
                </Box>
                <HStack
                  mt="5"
                  display={'flex'}
                  justifyContent={'flex-end'}
                  width={'100%'}>
                  <IconButton
                    aria-label="Search database"
                    icon={<AiOutlineLike />}
                    backgroundColor={'transparent'}
                    onClick={() => {
                      toast({
                        title: t('toast.thanks_feedback'),
                        description: '',
                        status: 'success',
                        duration: 1000,
                        isClosable: true,
                      });
                      submitFeedback(
                        Relevance['Relevant'],
                        resultItem.Id ?? '',
                        queryId
                      );
                    }}
                  />
                  <IconButton
                    aria-label="Search database"
                    icon={<AiOutlineDislike />}
                    backgroundColor={'transparent'}
                    onClick={() => {
                      toast({
                        title: t('toast.thanks_feedback'),
                        description: '',
                        status: 'success',
                        duration: 1000,
                        isClosable: true,
                      });
                      submitFeedback(
                        Relevance['NotRelevant'],
                        resultItem.Id ?? '',
                        queryId
                      );
                    }}
                  />
                </HStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    );
  } else {
    return <></>;
  }
};
