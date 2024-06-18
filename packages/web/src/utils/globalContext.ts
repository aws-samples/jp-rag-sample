import { Dispatch, SetStateAction, createContext } from 'react';
import { AiAgentHistory, Conversation, Dic, Filter } from './interface.tsx';

// Global変数
interface GlobalContextInterface {
  // 現在の結果
  currentConversation: Conversation | undefined;
  setCurrentConversation: Dispatch<SetStateAction<Conversation | undefined>>;
  // 現在適用中のフィルタ
  filterOptions: Filter[];
  setFilterOptions: Dispatch<SetStateAction<Filter[]>>;
  // Datasource情報
  datasourceInfo: Dic;
  setDatasourceInfo: Dispatch<SetStateAction<Dic>>;
  // 入力中の文字列
  currentInputText: string;
  setCurrentInputText: Dispatch<SetStateAction<string>>;
  // 直近のクエリ
  recentQueryList: string[];
  setRecentQueryList: Dispatch<SetStateAction<string[]>>;

  // 検索履歴ID
  currentQueryId: string;
  setCurrentQueryId: Dispatch<SetStateAction<string>>;

  // AI Agent の利用履歴
  aiAgent: AiAgentHistory;
  setAiAgent: Dispatch<SetStateAction<AiAgentHistory>>;
}

export const GlobalContext = createContext<GlobalContextInterface | undefined>(
  undefined
);
