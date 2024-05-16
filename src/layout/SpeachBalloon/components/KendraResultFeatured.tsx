// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)
import { Box } from "@chakra-ui/layout";
import { useToast, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import HighlightedTexts from "./HighlightedTexts";
import { FeaturedResultsItem } from "@aws-sdk/client-kendra";
import { Relevance, submitFeedback } from "../../../utils/service";
import { useGlobalContext } from '../../../App';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";
// i18
import { useTranslation } from "react-i18next";


export const KendraResultFeatured: React.FC<{
    queryId: string | undefined;
    resultItems: FeaturedResultsItem[];

}> = ({
    queryId, resultItems,
}) => {
        // 言語設定
        const { t } = useTranslation();
        // FeaturedResultを表示する
        const {
            pinnedTexts: pinnedTexts, setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast();

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500" pb='5'>
                    <Text p={2}>{t("body.featured_result")}</Text>

                    <Accordion allowMultiple>
                        {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                            <AccordionItem key={idx}>
                                <h2>
                                    <AccordionButton>
                                        <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                            submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId);
                                        }}
                                            isExternal>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            <ExternalLinkIcon mx='2px' />
                                        </Link>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <Box onClick={() => {
                                        setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"]);
                                        toast({
                                            title: t("toast.pinned"),
                                            description: "",
                                            status: 'success',
                                            duration: 1000,
                                            isClosable: true,
                                        });
                                    }}>
                                        <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Box>
            );
        } else {
            return (<></>);
        }
    };
