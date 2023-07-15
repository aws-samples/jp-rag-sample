import { Box, Heading, VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import HighlightedTexts from "./HighlightedTexts";
import { FeaturedResultsItem } from "@aws-sdk/client-kendra";
import { Relevance, submitFeedback } from "../../../utils/service";
import { useGlobalContext } from '../../../App';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";



export const KendraResultFeatured: React.FC<{
    queryId: string | undefined;
    resultItems: FeaturedResultsItem[];

}> = ({
    queryId, resultItems,
}) => {
        // FeaturedResultを表示する
        const {
            pinnedTexts: pinnedTexts, setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast();

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500">
                    <VStack align="start" w="85vw" minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                        <Tabs variant={"enclosed"} colorScheme='green'>
                            <TabList>
                                {resultItems.map((_resultItem: FeaturedResultsItem, idx: number) => (
                                    <Tab key={idx}>
                                        おすすめの文章 {idx}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                                    <TabPanel key={idx}>
                                        <Heading size="sm">
                                            <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId);
                                            }}
                                                isExternal>
                                                <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                <ExternalLinkIcon mx='2px' />
                                            </Link>
                                        </Heading>
                                        <Box onClick={() => {
                                            setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"]);
                                            toast({
                                                title: 'テキストがピン止めされました',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            });
                                        }}>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                        </Box>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </Box>
            );
        } else {
            return (<></>);
        }
    };
