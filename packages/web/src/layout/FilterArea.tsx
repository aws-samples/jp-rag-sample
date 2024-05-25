// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import React, { ChangeEventHandler, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderThumb,
  RangeSliderFilledTrack,
  Select,
  Input,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  useToast,
} from '@chakra-ui/react';
import {
  LANGUAGE_INDEX,
  LANGUAGES,
  SORT_ORDER_INDEX,
  SORT_ATTRIBUTE_INDEX,
  SORT_ORDER,
  MAX_INDEX,
  MIN_INDEX,
} from '../utils/constant';
import { Filter, selectItemType } from '../utils/interface';
import { useGlobalContext } from '../utils/useGlobalContext';
import {
  getAttributeFilter,
  getCurrentSortOrder,
  isArrayBoolean,
  isArrayDate,
  isArrayNumber,
  isArrayString,
} from '../utils/function';
import { kendraQuery, overwriteQuery } from '../utils/service';
// i18n
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

const SelectBoxes: React.FC<{
  onSelectionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  title: string;
  itemList: selectItemType[];
  currentSelection: string;
}> = ({
  onSelectionChange: onSelectionChange,
  title,
  itemList,
  currentSelection,
}) => {
  // 選択ボックス

  return (
    <Box pb="3">
      <Text>{title}</Text>
      <Select
        size="xs"
        onChange={onSelectionChange}
        defaultValue={currentSelection}
        width={'100%'}>
        {itemList.map((item) =>
          (() => {
            return (
              <option value={item.value} key={item.value}>
                {item.name}
              </option>
            );
          })()
        )}
      </Select>
    </Box>
  );
};

const SortOrderBox: React.FC<{
  onSortAttrChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortOrderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  title: string;
  itemList: selectItemType[];
  currentSortAttrSelection: string;
  currentSortOrderSelection: string;
}> = ({
  onSortAttrChange,
  onSortOrderChange,
  title,
  itemList,
  currentSortAttrSelection,
  currentSortOrderSelection,
}) => {
  // 並び順

  return (
    <Box pb="3">
      <Text>{title}</Text>
      <HStack>
        <Select
          size="xs"
          onChange={onSortAttrChange}
          defaultValue={currentSortAttrSelection}>
          {itemList.map((item) => (
            <option value={item.value} key={item.value}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select
          size="xs"
          onChange={onSortOrderChange}
          defaultValue={currentSortOrderSelection}>
          {SORT_ORDER.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </Select>
      </HStack>
    </Box>
  );
};

const CheckBoxes: React.FC<{
  onSelectionChange: (v: boolean, i: number) => void;
  title: string;
  itemList: selectItemType[];
  checkedItems: boolean[];
}> = ({
  onSelectionChange: onSelectionChange,
  title,
  itemList,
  checkedItems,
}) => {
  // チェックボックス
  const allChecked = checkedItems.every(Boolean);
  const isIndeterminate = checkedItems.some(Boolean) && !allChecked;

  return (
    <Box pb="3">
      <Text>{title}</Text>
      <Checkbox
        isChecked={allChecked}
        isIndeterminate={isIndeterminate}
        onChange={(e) => {
          onSelectionChange(e.target.checked, -1);
        }}
        colorScheme="green">
        ALL
      </Checkbox>
      <Stack pl={6} mt={1} spacing={1}>
        {itemList.map((item, idx) =>
          (() => {
            return (
              <Checkbox
                isChecked={checkedItems[idx]}
                onChange={(e) => {
                  onSelectionChange(e.target.checked, idx);
                }}
                key={item.name}
                value={idx}
                colorScheme="green"
                width={'100%'}
                wordBreak={'break-all'}>
                {item.name}
              </Checkbox>
            );
          })()
        )}
      </Stack>
    </Box>
  );
};

const RangeNumBox: React.FC<{
  onValueChange: (value: number[]) => void;
  title: string;
  itemList: selectItemType[];
  currentRange: number[];
}> = ({ onValueChange: onValueChange, title, itemList, currentRange }) => {
  // 数値範囲の選択ボックス

  return (
    <Box pb="3">
      <Text pb="5">{title}</Text>
      <RangeSlider
        defaultValue={[currentRange[MIN_INDEX], currentRange[MAX_INDEX]]}
        onChange={onValueChange}
        colorScheme="green"
        min={Number(itemList[MIN_INDEX].value)}
        max={Number(itemList[MAX_INDEX].value)}>
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb boxSize={5} index={0}>
          <Text pb="10">{currentRange[0]}</Text>
        </RangeSliderThumb>
        <RangeSliderThumb boxSize={5} index={1}>
          <Text pb="10">{currentRange[1]}</Text>
        </RangeSliderThumb>
      </RangeSlider>
    </Box>
  );
};

const RangeDateBox: React.FC<{
  onStartDateChange: ChangeEventHandler<HTMLInputElement>;
  onEndDateChange: ChangeEventHandler<HTMLInputElement>;
  title: string;
  currentTags: Date[];
}> = ({
  onStartDateChange: onStartDateChange,
  onEndDateChange: onEndDateChange,
  title,
  currentTags: currentRange,
}) => {
  //言語設定
  const { t } = useTranslation();

  // 時間の範囲の選択ボックス
  return (
    <Box pb="3">
      <Text>{title}</Text>
      <Text>
        {t('left_side_bar.parts.start_date')} -{' '}
        {t('left_side_bar.parts.end_date')}
      </Text>
      <HStack>
        <Input
          placeholder="Select Date and Time"
          size="sm"
          type="datetime-local"
          value={currentRange[0].toISOString().slice(0, 16)}
          onChange={onStartDateChange}
        />
        <Input
          placeholder="Select Date and Time"
          size="sm"
          type="datetime-local"
          value={currentRange[1].toISOString().slice(0, 16)}
          onChange={onEndDateChange}
        />
      </HStack>
    </Box>
  );
};

const ContainStringBox: React.FC<{
  onInsertTag: (value: string) => void;
  onDeleteTag: React.MouseEventHandler<HTMLButtonElement>;
  title: string;
  currentTags: string[];
}> = ({ onInsertTag, onDeleteTag, title, currentTags }) => {
  //言語設定
  const { t } = useTranslation();

  // 文字列
  const [text, setText] = useState('');

  return (
    <Box pb="3">
      <Text>{title}</Text>
      <Input
        list="mylist"
        size="sm"
        placeholder={t('left_side_bar.parts.included_string')}
        onChange={(e) => {
          setText(e.currentTarget.value);
        }}
        value={text}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.key !== 'Enter') return;

          onInsertTag(e.currentTarget.value);
          setText('');
        }}
      />
      <VStack spacing={4}>
        {currentTags.map((v) => (
          <Tag
            size="sm"
            key={v}
            borderRadius="full"
            variant="solid"
            colorScheme="green">
            <TagLabel>{v}</TagLabel>
            <TagCloseButton value={v} onClick={onDeleteTag} />
          </Tag>
        ))}
      </VStack>
    </Box>
  );
};

export default function FilterArea() {
  //言語設定
  const { t } = useTranslation();
  // 画面左にあるフィルター
  const {
    currentConversation: currentConversation,
    setCurrentConversation: setCurrentConversation,
    filterOptions: filterOptions,
    setFilterOptions: setFilterOptions,
  } = useGlobalContext();

  const toast = useToast();

  function filter_name_converter(filter_id: string): string {
    // ファセット ID を 読みやすい名前(フィルタの種類名)に変換

    switch (filter_id) {
      case '_authors':
        return t('left_side_bar.filter_option_name.authors');
      case '_category':
        return t('left_side_bar.filter_option_name.category');
      case '_created_at':
        return t('left_side_bar.filter_option_name.created_at');
      case '_data_source_id':
        return t('left_side_bar.filter_option_name.data_source_id');
      case '_document_body':
        return t('left_side_bar.filter_option_name.document_body');
      case '_document_id':
        return t('left_side_bar.filter_option_name.document_id');
      case '_document_title':
        return t('left_side_bar.filter_option_name.document_title');
      case '_excerpt_page_number':
        return t('left_side_bar.filter_option_name.excerpt_page_number');
      case '_faq_id':
        return t('left_side_bar.filter_option_name.faq_id');
      case '_file_type':
        return t('left_side_bar.filter_option_name.file_type');
      case '_language_code':
        return t('left_side_bar.filter_option_name.language_code');
      case '_last_updated_at':
        return t('left_side_bar.filter_option_name.last_updated_at');
      case '_source_uri':
        return t('left_side_bar.filter_option_name.source_uri');
      case '_tenant_id':
        return t('left_side_bar.filter_option_name.tenant_id');
      case '_version':
        return t('left_side_bar.filter_option_name.version');
      case '_view_count':
        return t('left_side_bar.filter_option_name.view_count');
    }
    return filter_id;
  }

  return (
    <Box w="15%" bg={'white'}>
      <VStack p={'5'} align={'left'}>
        <div>
          {filterOptions
            .filter((option) => option !== undefined)
            .map((tmpCheckBoxItem: Filter, tmpCheckBoxItemId: number) =>
              (() => {
                // 言語設定
                if (
                  tmpCheckBoxItem.filterType === 'LAUNGUAGE_SETTING' &&
                  isArrayString(tmpCheckBoxItem.selected)
                ) {
                  return (
                    <SelectBoxes
                      onSelectionChange={(event) => {
                        filterOptions[tmpCheckBoxItemId].selected = [
                          event.target.value,
                        ];
                        // 表示言語を変更
                        i18n.changeLanguage(event.target.value);

                        setFilterOptions([...filterOptions]);
                      }}
                      title={t('left_side_bar.filter_option_name.lang_setting')}
                      itemList={LANGUAGES}
                      currentSelection={
                        tmpCheckBoxItem.selected[LANGUAGE_INDEX]
                      }
                      key={tmpCheckBoxItemId}
                    />
                  );
                } else if (
                  tmpCheckBoxItem.filterType === 'SORT_BY' &&
                  isArrayString(tmpCheckBoxItem.selected)
                ) {
                  // 並び順
                  return (
                    <SortOrderBox
                      onSortAttrChange={(e) => {
                        filterOptions[tmpCheckBoxItemId].selected[
                          SORT_ATTRIBUTE_INDEX
                        ] = e.currentTarget.value;
                      }}
                      onSortOrderChange={(e) => {
                        filterOptions[tmpCheckBoxItemId].selected[
                          SORT_ORDER_INDEX
                        ] = e.currentTarget.value;
                      }}
                      title={t('left_side_bar.filter_option_name.sort_order')}
                      itemList={tmpCheckBoxItem.options}
                      currentSortAttrSelection={
                        tmpCheckBoxItem.selected[SORT_ATTRIBUTE_INDEX]
                      }
                      currentSortOrderSelection={
                        tmpCheckBoxItem.selected[SORT_ORDER_INDEX]
                      }
                      key={tmpCheckBoxItemId}
                    />
                  );
                } else if (
                  tmpCheckBoxItem.filterType ===
                    'SELECT_MULTI_STRING_FROM_LIST' &&
                  isArrayBoolean(tmpCheckBoxItem.selected)
                ) {
                  // チェックボックス
                  return (
                    <CheckBoxes
                      onSelectionChange={(v, vi) => {
                        for (
                          let i = 0;
                          i < tmpCheckBoxItem.selected.length;
                          i++
                        ) {
                          if (vi === -1 || vi === i) {
                            filterOptions[tmpCheckBoxItemId].selected[i] = v;
                          }
                        }
                        setFilterOptions([...filterOptions]);
                      }}
                      title={filter_name_converter(tmpCheckBoxItem.title)}
                      itemList={tmpCheckBoxItem.options}
                      checkedItems={tmpCheckBoxItem.selected}
                      key={tmpCheckBoxItemId}
                    />
                  );
                } else if (
                  tmpCheckBoxItem.filterType === 'RANGE_NUM' &&
                  isArrayNumber(tmpCheckBoxItem.selected)
                ) {
                  // 数値
                  return (
                    <RangeNumBox
                      onValueChange={(e) => {
                        filterOptions[tmpCheckBoxItemId].selected = e;
                        setFilterOptions([...filterOptions]);
                      }}
                      title={filter_name_converter(tmpCheckBoxItem.title)}
                      itemList={tmpCheckBoxItem.options}
                      currentRange={tmpCheckBoxItem.selected}
                      key={tmpCheckBoxItemId}
                    />
                  );
                } else if (
                  tmpCheckBoxItem.filterType === 'RANGE_DATE' &&
                  isArrayDate(tmpCheckBoxItem.selected)
                ) {
                  // 日付
                  return (
                    <RangeDateBox
                      onStartDateChange={(v) => {
                        filterOptions[tmpCheckBoxItemId].selected[0] = new Date(
                          v.currentTarget.value
                        );
                        setFilterOptions([...filterOptions]);
                      }}
                      onEndDateChange={(v) => {
                        filterOptions[tmpCheckBoxItemId].selected[1] = new Date(
                          v.currentTarget.value
                        );
                        setFilterOptions([...filterOptions]);
                      }}
                      title={filter_name_converter(tmpCheckBoxItem.title)}
                      currentTags={tmpCheckBoxItem.selected}
                      key={tmpCheckBoxItemId}
                    />
                  );
                } else if (
                  tmpCheckBoxItem.filterType === 'CONTAIN_STRING' &&
                  isArrayString(tmpCheckBoxItem.selected)
                ) {
                  // 文字列
                  return (
                    <ContainStringBox
                      onInsertTag={(newTag) => {
                        const tempSelected: string[] = filterOptions[
                          tmpCheckBoxItemId
                        ].selected as string[];
                        if (!tempSelected.includes(newTag)) {
                          filterOptions[tmpCheckBoxItemId].selected = [
                            ...tempSelected,
                            newTag,
                          ];
                          setFilterOptions([...filterOptions]);
                        }
                      }}
                      onDeleteTag={(e) => {
                        const tmpSelected: string[] = filterOptions[
                          tmpCheckBoxItemId
                        ].selected as string[];
                        const index = tmpSelected.indexOf(
                          e.currentTarget.value
                        );
                        tmpSelected.splice(index, 1);
                        filterOptions[tmpCheckBoxItemId].selected = tmpSelected;
                        setFilterOptions([...filterOptions]);
                      }}
                      title={filter_name_converter(tmpCheckBoxItem.title)}
                      currentTags={tmpCheckBoxItem.selected}
                      key={tmpCheckBoxItemId}
                    />
                  );
                }
                return <div key={tmpCheckBoxItemId}></div>;
              })()
            )}
        </div>
        {/* ボタン */}
        <Button
          colorScheme="green"
          size="xs"
          onClick={() => {
            /*
             * Filterした Kendraへのリクエスト
             *
             *
             * F. Kendraへのリクエストをフィルタ
             *
             * F-1. currentConversation.userQuery があるとき (top barから検索済みであること)を確認
             * F-2. currentConversation.userQuery の言語設定、ソート順、フィルタを変更しクエリを再実行
             * F-3. 受け取ったレスポンスを元にInteractionAreaを描画
             */

            const run = async () => {
              // F-1. currentConversation.userQuery があるとき (top barから検索済みであること)を確認
              if (currentConversation?.userQuery !== undefined) {
                // F-2. currentConversation.userQuery の言語設定、ソート順、フィルタを変更しクエリを再実行
                const q = overwriteQuery(
                  currentConversation.userQuery,
                  getAttributeFilter(filterOptions),
                  getCurrentSortOrder(filterOptions)
                );
                await kendraQuery(q)
                  .then((data) => {
                    // F-3. 受け取ったレスポンスを元にInteractionAreaを描画
                    setCurrentConversation({
                      ...currentConversation,
                      kendraResponse: data,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    toast({
                      title: t('toast.invalid_filter'),
                      description: '',
                      status: 'error',
                      duration: 1000,
                      isClosable: true,
                    });
                  });
              }
            };
            run();
          }}>
          {t('left_side_bar.parts.apply')}
        </Button>
      </VStack>
    </Box>
  );
}
