
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import TopBar from "./layout/TopBar.tsx"
import FilterBar from './layout/FilterBar.tsx'
import { initAWSError } from "./services/AWS.ts";
import MockDataWarning from "./services/helpers/MockDataWarning.tsx";
import LocalCredentialsBanner from "./services/helpers/LocalCredentialsBanner.tsx";
import { Conversation, Filter } from "./utils/interface.tsx";
import InteractionArea from "./layout/InteractionArea.tsx";
import { getSortOrderFromIndex } from "./utils/function.tsx";
import { DEFAULT_LANGUAGE, DEFAULT_SEARCH_MODE } from "./utils/constant.tsx";



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
  const [pinnedTexts, setPinnedTexts] = useState<string[]>([]); // ピン止されたテキスト一覧
  const [currentSearchMode, setCurrentSearchMode] = useState<string>(DEFAULT_SEARCH_MODE); // 検索モード
  const [currentInputText, setCurrentInputText] = useState<string>(""); // 入力中の文字列

  useEffect(() => {
    // Stateの初期設定

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

    // TODO: 削除
    // // ソート順序の Dummy データを挿入
    // filterOption.push(...dummyFullFilterOptions())
    // setFilterOptions(filterOption)

    // // Dummy の Query結果を挿入
    // const tmpCurrentConversation: Conversation = dummyHumanKendraAiConversation()
    // setCurrentConversation(tmpCurrentConversation)

    // // Dummy の履歴データを挿入
    // const tmphistory: Conversation[] = dummyHistory()
    // setHistory(tmphistory)

    // Dummy Kendraへのリクエスト
    // const run = async () => {
    //   const q = getKendraQuery(
    //     currentInputText,
    //     getAttributeFilter(filterOptions),
    //     getCurrentSortOrder(filterOptions))
  
    //   console.log("[DEBUG] : fetchData",
    //     await kendraQuery(q))
    // }
    // run()

  }, [])

return (
  <>
    {/* 開発モードの場合は警告を出す */}
    <div style={{ backgroundColor: "orange" }}>
      {initAWSError.length > 0 ? (
        <MockDataWarning errors={initAWSError} />
      ) : (
        <LocalCredentialsBanner />
      )}
    </div>
    {/* 検索画面 */}
    <GlobalContext.Provider value={{
      currentConversation: currentConversation,
      setCurrentConversation: setCurrentConversation,
      history: history,
      setHistory: setHistory,
      filterOptions: filterOptions,
      setFilterOptions: setFilterOptions,
      pinnedTexts: pinnedTexts,
      setPinnedTexts: setPinnedTexts,
      currentSearchMode: currentSearchMode,
      setCurrentSearchMode: setCurrentSearchMode,
      currentInputText: currentInputText,
      setCurrentInputText: setCurrentInputText,
    }}>
      {/* API通信用のモック */}
      <TopBar />
      <FilterBar>
        <InteractionArea />
      </FilterBar>
    </GlobalContext.Provider>
  </>
)
}

export default App
