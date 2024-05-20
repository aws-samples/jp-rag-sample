// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import TopBar from "./layout/TopBar.tsx"
import MainArea from './layout/MainArea.tsx'
import { getSortOrderFromIndex, getDatasourceInfo, setJwtToken } from "./utils/service.ts";
import { AiAgentHistory, Conversation, Dic, Filter } from "./utils/interface.tsx";
import { DEFAULT_LANGUAGE } from "./utils/constant.tsx";
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
  // 現在適用中のフィルタ
  filterOptions: (Filter)[];
  setFilterOptions: Dispatch<SetStateAction<(Filter)[]>>;
  // Datasource情報
  datasourceInfo: Dic;
  setDatasourceInfo: Dispatch<SetStateAction<Dic>>;
  // 入力中の文字列
  currentInputText: string
  setCurrentInputText: Dispatch<SetStateAction<string>>;
  // 直近のクエリ
  recentQueryList: (string)[];
  setRecentQueryList: Dispatch<SetStateAction<(string)[]>>;

  // 検索履歴ID
  currentQueryId: string
  setCurrentQueryId: Dispatch<SetStateAction<string>>;

  // AI Agent の利用履歴
  aiAgent: AiAgentHistory
  setAiAgent: Dispatch<SetStateAction<AiAgentHistory>>;
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
  const [filterOptions, setFilterOptions] = useState<(Filter)[]>([]); // 現在適用中のフィルタ
  const [datasourceInfo, setDatasourceInfo] = useState<Dic>({}); // データソース情報
  const [currentInputText, setCurrentInputText] = useState<string>(""); // 入力中の文字列
  const [loginSucceeded, setLoginSucceeded] = useState<boolean>(false); // ログイン完了フラグ
  const [recentQueryList, setRecentQueryList] = useState<(string)[]>([]);  // 直近のクエリ
  // 検索履歴ID
  const [currentQueryId, setCurrentQueryId] = useState<string>("initialState");
  // AI Agent の利用履歴
  const [aiAgent, setAiAgent] = useState<AiAgentHistory>({
    'initialState': {
      aiAgentResponse: '',
      aiSelectedInfoList: [],
      suggestedQuery: [],
      systemLog: [],
      diveDeepIsEnabled: false,
      userQuery: ''
    },
  });

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
            filterOptions: filterOptions,
            setFilterOptions: setFilterOptions,
            datasourceInfo: datasourceInfo,
            setDatasourceInfo: setDatasourceInfo,
            currentInputText: currentInputText,
            setCurrentInputText: setCurrentInputText,
            recentQueryList: recentQueryList,
            setRecentQueryList: setRecentQueryList,
            currentQueryId: currentQueryId,
            setCurrentQueryId: setCurrentQueryId,
            aiAgent: aiAgent,
            setAiAgent: setAiAgent
          }}>
            {/* API通信用のモック */}
            <TopBar logout={signOut} user={user} />
            <MainArea />
          </GlobalContext.Provider>
        </>
      )}
    </Authenticator>

  )
}

export default App
