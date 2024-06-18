// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { useEffect, useState } from 'react';
import TopBar from './layout/TopBar.tsx';
import MainArea from './layout/MainArea.tsx';
import { getSortOrderFromIndex, getDatasourceInfo } from './utils/service.ts';
import {
  AiAgentHistory,
  Conversation,
  Dic,
  Filter,
} from './utils/interface.tsx';
import { DEFAULT_LANGUAGE } from './utils/constant.tsx';
import { GlobalContext } from './utils/globalContext';
// Amplify
import { useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// i18
import './i18n/configs.ts';

function App() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [currentConversation, setCurrentConversation] = useState<
    Conversation | undefined
  >(); // 現在の結果
  const [filterOptions, setFilterOptions] = useState<Filter[]>([]); // 現在適用中のフィルタ
  const [datasourceInfo, setDatasourceInfo] = useState<Dic>({}); // データソース情報
  const [currentInputText, setCurrentInputText] = useState<string>(''); // 入力中の文字列
  // const [loginSucceeded, setLoginSucceeded] = useState<boolean>(false); // ログイン完了フラグ
  const [recentQueryList, setRecentQueryList] = useState<string[]>([]); // 直近のクエリ
  // 検索履歴ID
  const [currentQueryId, setCurrentQueryId] = useState<string>('initialState');
  // AI Agent の利用履歴
  const [aiAgent, setAiAgent] = useState<AiAgentHistory>({
    initialState: {
      aiAgentResponse: '',
      aiSelectedInfoList: [],
      suggestedQuery: [],
      systemLog: [],
      diveDeepIsEnabled: false,
      userQuery: '',
    },
  });

  useEffect(() => {
    // Stateの初期設定
    if (user) {
      // 言語設定とソートの候補を取得
      const filterOption: Filter[] = [
        {
          filterType: 'LAUNGUAGE_SETTING',
          title: '言語設定',
          options: [],
          selected: [DEFAULT_LANGUAGE],
        },
      ];
      const getSortOrderFromIndexAndSetSortOption = async () => {
        const so = await getSortOrderFromIndex();
        filterOption.push(so);
        setFilterOptions(filterOption);
      };
      getSortOrderFromIndexAndSetSortOption();

      const getDataSourceInfo = async () => {
        const dsi = await getDatasourceInfo();
        setDatasourceInfo(dsi);
      };
      getDataSourceInfo();
    }
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
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
        setAiAgent: setAiAgent,
      }}>
      <TopBar logout={signOut} user={user} />
      <MainArea />
    </GlobalContext.Provider>
  );
}

export default App;
