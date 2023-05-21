import React, { ChangeEventHandler, ReactNode, useEffect, useState } from "react";
import {
  Box,
  Flex,
  useColorModeValue,
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
  SliderMark,
} from '@chakra-ui/react';
import { DEFAULT_LANGUAGE, LANGUAGE_INDEX, DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER, LANGUAGES, SORT_ORDER_INDEX, SORT_ATTRIBUTE_INDEX, SORT_ORDER } from '../utils/constant';
import { Filter, selectItemType } from '../utils/interface';
import { useGlobalContext } from "../App";

const SelectBoxes: React.FC<{
  onSelectionChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  title: string
  itemList: selectItemType[]
  currentSelection: string
}> = ({ onSelectionChange: onSelectionChange, title, itemList, currentSelection }) => {
  return (
    <>
      <Text>{title}</Text>
      <Select size='xs' onChange={onSelectionChange} defaultValue={currentSelection}>
        {
          itemList.map((item) => (
            (() => {
              return (<option value={item.value} key={item.value} >{item.name}</option>)
            })()
          ))
        }
      </Select>
    </>
  )
}

const SortOrderBox: React.FC<{
  onSortAttrChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onSortOrderChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  title: string
  itemList: selectItemType[]
  currentSortAttrSelection: string
  currentSortOrderSelection: string
}> = ({ onSortAttrChange, onSortOrderChange, title, itemList, currentSortAttrSelection, currentSortOrderSelection }) => {
  return (
    <>
      <Text>{title}</Text>
      <HStack>
        <Select size='xs' onChange={onSortAttrChange} defaultValue={currentSortAttrSelection}>
          {
            itemList.map((item) => (
              (() => {
                return (<option value={item.value} key={item.value} >{item.name}</option>)
              })()
            ))
          }
        </Select>
        <Select size='xs' onChange={onSortOrderChange} defaultValue={currentSortOrderSelection}>
          {
            SORT_ORDER.map((item) => (
              (() => {
                return (<option value={item} key={item} >{item}</option>)
              })()
            ))
          }
        </Select>
      </HStack>
    </>
  )
}

const CheckBoxes: React.FC<{
  onSelectionChange: (
    v: boolean,
    i: number
  ) => void;
  title: string
  itemList: selectItemType[]
  checkedItems: boolean[]
}> = ({ onSelectionChange: onSelectionChange, title, itemList, checkedItems }) => {

  const allChecked = checkedItems.every(Boolean)
  const isIndeterminate = checkedItems.some(Boolean) && !allChecked

  return (
    <>
      <Text>{title}</Text>
      <Checkbox
        isChecked={allChecked}
        isIndeterminate={isIndeterminate}
        onChange={((e) => {
          onSelectionChange(e.target.checked, -1)
        })}
        colorScheme='green'
      >
        ALL
      </Checkbox>
      <Stack pl={6} mt={1} spacing={1}>
        {
          itemList.map((item, idx) => (

            (() => {
              return (
                <Checkbox
                  isChecked={checkedItems[idx]}
                  onChange={((e) => {
                    onSelectionChange(e.target.checked, idx)
                  })
                  }
                  key={item.name}
                  value={idx}
                  colorScheme='green'
                >
                  {item.name}
                </Checkbox>
              )
            })()
          ))
        }
      </Stack>
    </>
  )
}

const RangeNumBox: React.FC<{
  onValueChange: (
    value: number[]
  ) => void;
  title: string
  itemList: selectItemType[]
  currentRange: number[]
}> = ({ onValueChange: onValueChange, title, itemList, currentRange }) => {
  return (
    <>
      <Text pb='5'>{title}</Text>
      <RangeSlider
        defaultValue={[currentRange[0], currentRange[1]]}
        onChange={onValueChange}
        colorScheme='green'
        min={Number(itemList[0].value)}
        max={Number(itemList[1].value)}>
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
    </>
  )
}

const RangeDateBox: React.FC<{
  onStartDateChange: ChangeEventHandler<HTMLInputElement>
  onEndDateChange: ChangeEventHandler<HTMLInputElement>
  title: string
  currentTags: Date[]
}> = ({ onStartDateChange: onStartDateChange, onEndDateChange: onEndDateChange, title, currentTags: currentRange }) => {
  return (
    <>
      <Text>{title}</Text>
      <Text>開始 - 終了</Text>
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
    </>
  )
}

const ContainStringBox: React.FC<{
  onInsertTag: (
    value: string
  ) => void;
  onDeleteTag: React.MouseEventHandler<HTMLButtonElement>
  title: string
  currentTags: string[]
}> = ({ onInsertTag, onDeleteTag, title, currentTags }) => {
  {/* 自由入力 */ }
  const [text, setText] = useState("");

  return (
    <>
      <Text>{title}</Text>
      <Input list='mylist' size="sm" placeholder='の文字列を含む' onChange={
        (e) => {
          setText(e.currentTarget.value)
        }}
        value={text} onKeyDown={
          (e) => {
            if (e.nativeEvent.isComposing || e.key !== 'Enter') return

            onInsertTag(e.currentTarget.value)
            setText("")
          }
        } />
      <VStack spacing={4}>
        {currentTags.map((v) => (
          <Tag
            size='sm'
            key={v}
            borderRadius='full'
            variant='solid'
            colorScheme='green'
          >
            <TagLabel>{v}</TagLabel>
            <TagCloseButton value={v} onClick={onDeleteTag} />
          </Tag>
        ))}
      </VStack>
    </>
  )
}

function isArrayBoolean(arr: any[]): arr is boolean[] {
  return arr.every((item) => typeof item === 'boolean');
}

function isArrayString(arr: any[]): arr is string[] {
  return arr.every((item) => typeof item === 'string');
}

function isArrayNumber(arr: any[]): arr is number[] {
  return arr.every((item) => typeof item === 'number');
}

function isArrayDate(arr: any[]): arr is Date[] {
  return arr.every((item) => item instanceof Date);
}

export default function SideBar({ children }: { children: ReactNode }) {
  const {
      history: history,
      setHistory: setHistory,
      filterOptions: filterOptions,
      setFilterOptions: setFilterOptions,
  } = useGlobalContext();

  return (
    <Box h="92vh"
      mt="10vh"
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}>
      <Box
        w="15vw"
        bg={'white'}
        pos="absolute">
        <VStack p={"5"} align={"left"}>

          <div>
            {
              filterOptions.map((tmpCheckBoxItem: Filter, tmpCheckBoxItemId: number) => (
                (() => {
                  // 言語設定
                  if (tmpCheckBoxItem.filterType === "LAUNGUAGE_SETTING" && isArrayString(tmpCheckBoxItem.selected)) {
                    return (
                      <SelectBoxes
                        onSelectionChange={(event) => {
                          filterOptions[tmpCheckBoxItemId].selected = [event.target.value]
                          setFilterOptions([...filterOptions])
                        }}
                        title={tmpCheckBoxItem.title}
                        itemList={LANGUAGES}
                        currentSelection={tmpCheckBoxItem.selected[LANGUAGE_INDEX]}
                        key={tmpCheckBoxItemId}
                      />
                    )
                  } else if (tmpCheckBoxItem.filterType === "SORT_BY" && isArrayString(tmpCheckBoxItem.selected)) {
                    // 並び順
                    return (
                      <SortOrderBox
                        onSortAttrChange={(e) => {
                          filterOptions[tmpCheckBoxItemId].selected[SORT_ATTRIBUTE_INDEX] = e.currentTarget.value
                        }}
                        onSortOrderChange={(e) => {
                          filterOptions[tmpCheckBoxItemId].selected[SORT_ORDER_INDEX] = e.currentTarget.value
                        }
                        }
                        title={tmpCheckBoxItem.title}
                        itemList={tmpCheckBoxItem.options}
                        currentSortAttrSelection={tmpCheckBoxItem.selected[SORT_ATTRIBUTE_INDEX]}
                        currentSortOrderSelection={tmpCheckBoxItem.selected[SORT_ORDER_INDEX]}
                        key={tmpCheckBoxItemId} />
                    )
                  } else if (tmpCheckBoxItem.filterType === "SELECT_MULTI_STRING" && isArrayBoolean(tmpCheckBoxItem.selected)) {
                    // チェックボックス
                    return (
                      <CheckBoxes
                        onSelectionChange={(v, vi) => {
                          for (let i = 0; i < tmpCheckBoxItem.selected.length; i++) {
                            if (vi === -1 || vi === i) {
                              filterOptions[tmpCheckBoxItemId].selected[i] = v
                            }
                          }
                          setFilterOptions([...filterOptions])
                        }}
                        title={tmpCheckBoxItem.title}
                        itemList={tmpCheckBoxItem.options}
                        checkedItems={tmpCheckBoxItem.selected}
                        key={tmpCheckBoxItemId} />
                    )
                  } else if (tmpCheckBoxItem.filterType === "RANGE_NUM" && isArrayNumber(tmpCheckBoxItem.selected)) {
                    // 数値
                    return (
                      <RangeNumBox
                        onValueChange={(e) => {
                          filterOptions[tmpCheckBoxItemId].selected = e
                          setFilterOptions([...filterOptions])
                        }}
                        title={tmpCheckBoxItem.title}
                        itemList={tmpCheckBoxItem.options}
                        currentRange={tmpCheckBoxItem.selected}
                        key={tmpCheckBoxItemId} />
                    )

                  } else if (tmpCheckBoxItem.filterType === "RANGE_DATE" && isArrayDate(tmpCheckBoxItem.selected)) {
                    // 日付
                    return (
                      <RangeDateBox
                        onStartDateChange={(v) => {
                          filterOptions[tmpCheckBoxItemId].selected[0] = new Date(v.currentTarget.value)
                          setFilterOptions([...filterOptions])
                        }}
                        onEndDateChange={(v) => {
                          filterOptions[tmpCheckBoxItemId].selected[1] = new Date(v.currentTarget.value)
                          setFilterOptions([...filterOptions])
                        }}
                        title={tmpCheckBoxItem.title}
                        currentTags={tmpCheckBoxItem.selected}
                        key={tmpCheckBoxItemId} />
                    )
                  } else if (tmpCheckBoxItem.filterType === "CONTAIN_STRING" && isArrayString(tmpCheckBoxItem.selected)) {
                    // 文字列
                    return (
                      <ContainStringBox
                        onInsertTag={(newTag) => {
                          const tempSelected: string[] = filterOptions[tmpCheckBoxItemId].selected as string[]
                          if (!tempSelected.includes(newTag)) {
                            filterOptions[tmpCheckBoxItemId].selected = [...tempSelected, newTag]
                            setFilterOptions([...filterOptions])
                          }
                        }}
                        onDeleteTag={(e) => {
                          const tmpSelected: string[] = filterOptions[tmpCheckBoxItemId].selected as string[]
                          const index = tmpSelected.indexOf(e.currentTarget.value);
                          tmpSelected.splice(index, 1)
                          filterOptions[tmpCheckBoxItemId].selected = tmpSelected
                          setFilterOptions([...filterOptions])
                        }}
                        title={tmpCheckBoxItem.title}
                        currentTags={tmpCheckBoxItem.selected}
                        key={tmpCheckBoxItemId} />
                    )

                  }
                  return (
                    <div key={tmpCheckBoxItemId}></div>
                  )
                })()
              ))
            }
          </div>
          {/* ボタン */}
          <Button colorScheme='green' size='xs'>適用</Button>
        </VStack>
      </Box>
      {/* 本体 */}
      <Flex mt="10vh" ml="15vw" w="85vw" h="92vh">
        {children}
      </Flex>
    </Box>
  );
}