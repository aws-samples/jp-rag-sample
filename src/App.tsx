// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import TopBar from "./layout/TopBar.tsx"
import FilterBar from './layout/FilterBar.tsx'
import { getSortOrderFromIndex, getDatasourceInfo, setJwtToken } from "./utils/service.ts";
import { Conversation, Dic, Filter } from "./utils/interface.tsx";
import InteractionArea from "./layout/InteractionArea.tsx";
import { DEFAULT_LANGUAGE, DEFAULT_SEARCH_MODE } from "./utils/constant.tsx";
// Amplify
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// i18
import "./i18n/configs.ts"

// Global変数
interface GlobalContextInterface {
  // 現在の結果
  currentConversation: Conversation | undefined;
  setCurrentConversation: Dispatch<SetStateAction<Conversation | undefined>>;
  // 会話の履歴
  history: (Conversation)[];
  setHistory: Dispatch<SetStateAction<(Conversation)[]>>;
  // 現在適用中のフィルタ
  filterOptions: (Filter)[];
  setFilterOptions: Dispatch<SetStateAction<(Filter)[]>>;
  // Datasource情報
  datasourceInfo: Dic;
  setDatasourceInfo: Dispatch<SetStateAction<Dic>>;
  // ピン止めされたテキスト
  pinnedTexts: string[];
  setPinnedTexts: Dispatch<SetStateAction<string[]>>;
  // 現在のモード
  currentSearchMode: string
  setCurrentSearchMode: Dispatch<SetStateAction<string>>;
  // 入力中の文字列
  currentInputText: string
  setCurrentInputText: Dispatch<SetStateAction<string>>;
}
const GlobalContext = createContext<GlobalContextInterface | undefined>(undefined);
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
}

function App() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>(); // 現在の結果
  const [history, setHistory] = useState<(Conversation)[]>([]); // 会話の履歴
  const [filterOptions, setFilterOptions] = useState<(Filter)[]>([]); // 現在適用中のフィルタ
  const [datasourceInfo, setDatasourceInfo] = useState<Dic>({}); // データソース情報
  const [pinnedTexts, setPinnedTexts] = useState<string[]>([]); // ピン止されたテキスト一覧
  const [currentSearchMode, setCurrentSearchMode] = useState<string>(DEFAULT_SEARCH_MODE); // 検索モード
  const [currentInputText, setCurrentInputText] = useState<string>(""); // 入力中の文字列
  const [loginSucceeded, setLoginSucceeded] = useState<boolean>(false); // ログイン完了フラグ

  useEffect(() => {
    // Stateの初期設定
    if (loginSucceeded) {
      // 言語設定とソートの候補を取得
      const filterOption: Filter[] = [
        {
          filterType: "LAUNGUAGE_SETTING",
          title: "言語設定",
          options: [],
          selected: [DEFAULT_LANGUAGE]
        }
      ]
      const getSOrtOrderFromIndexAndSetSortOption = async () => {
        const so = await getSortOrderFromIndex()
        filterOption.push(so)
        setFilterOptions(filterOption)
      }
      getSOrtOrderFromIndexAndSetSortOption()

      const getDataSourceInfo = async () => {
        const dsi = await getDatasourceInfo()
        setDatasourceInfo(dsi)
      }
      getDataSourceInfo()
    }

  }, [loginSucceeded])

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          {
            (() => {
              if (!loginSucceeded) {
                // Login 成功後 user pool から jwt token, id pool から iam credential を取得 
                setJwtToken(user?.getSignInUserSession()?.getAccessToken().getJwtToken() ?? "")
                setLoginSucceeded(true)
              }
            })()
          }
          {/* 検索画面 */}
          <GlobalContext.Provider value={{
            currentConversation: currentConversation,
            setCurrentConversation: setCurrentConversation,
            history: history,
            setHistory: setHistory,
            filterOptions: filterOptions,
            setFilterOptions: setFilterOptions,
            datasourceInfo: datasourceInfo,
            setDatasourceInfo: setDatasourceInfo,
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
            currentSearchMode: currentSearchMode,
            setCurrentSearchMode: setCurrentSearchMode,
            currentInputText: currentInputText,
            setCurrentInputText: setCurrentInputText,
          }}>
            {/* API通信用のモック */}
            <TopBar logout={signOut} user={user} />
            <FilterBar>
              <InteractionArea />
            </FilterBar>
          </GlobalContext.Provider>
        </>
      )}
    </Authenticator>

  )
}

export default App
