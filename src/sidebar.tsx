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
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Input,
} from '@chakra-ui/react';

export default function SimpleSidebar({ children }: { children: ReactNode }) {
  return (
    <Box h="92vh"
      mt="10vh"
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}>
      <Box
        w="15vw"
        bg={'white'}
        pos="fixed">
        {/* <Flex h="20" mx="8" alignItems="center">
        </Flex> */}
        <VStack p={"5"} align={"left"}>
          <Text>言語設定</Text>
          <Select size='xs'>
            <option value='option1'>英語</option>
            <option value='option2'>フランス語</option>
            <option value='option3'>日本語</option>
          </Select>
          <Text>並び替え</Text>
          <Select size='xs'>
            <option value='option1'>関連度</option>
            <option value='option2'>更新日時</option>
          </Select>
          <Text>ファセット</Text>
          {/* チェックボックス */}
          <Checkbox colorScheme='green' >Checkbox</Checkbox>
          {/* スライドレンジ */}
          <RangeSlider
            aria-label={['min', 'max']}
            colorScheme='green'
            defaultValue={[10, 30]}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          {/* スライド */}
          <Slider aria-label='slider-ex-2' colorScheme='green' defaultValue={30}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          {/* セレクション */}
          <Select placeholder='Select option' size='xs'>
            <option value='option1'>Option 1</option>
            <option value='option2'>Option 2</option>
            <option value='option3'>Option 3</option>
          </Select>
          {/* ボタン */}
          <Button colorScheme='green' size='xs'>適用</Button>
          <Input autoComplete='on' list='mylist'>
          </Input>
            <datalist id="mylist">
              <option value="渋谷"></option>
              <option value="新宿"></option>
              <option value="新橋"></option>
              <option value="新大阪"></option>
              <option value="原宿"></option>
            </datalist>
        </VStack>
      </Box>
      {/* 本体 */}
      <Flex mt="10vh" ml="15vw" w="85vw" h="92vh">
        {children}
      </Flex>
    </Box>
  );
}