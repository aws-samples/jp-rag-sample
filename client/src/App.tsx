
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import TopBar from "./layout/TopBar.tsx"
import SideBar from './layout/SideBar.tsx'
import AuthMock from "./layout/AuthMock.tsx";
import { indexId, kendraClient, initAWSError } from "./services/AWS.ts";
import MockDataWarning from "./services/helpers/MockDataWarning.tsx";
import LocalCredentialsBanner from "./services/helpers/LocalCredentialsBanner.tsx";
import { Conversation, Filter } from "./utils/interface.tsx";
import InteractionArea from "./layout/InteractionArea.tsx";
import { DEFAULT_LANGUAGE, DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER } from "./utils/constant.tsx";



// Global変数
interface GlobalContextInterface {
  history: (Conversation)[];
  setHistory: Dispatch<SetStateAction<(Conversation)[]>>;
  filterOptions: (Filter)[];
  setFilterOptions: Dispatch<SetStateAction<(Filter)[]>>;
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
  const [history, setHistory] = useState<(Conversation)[]>([]); // 会話のやり取り
  const [filterOptions, setFilterOptions] = useState<(Filter)[]>([]); // 会話のやり取り

  useEffect(() => {
    const tmpFilterOption: Filter[] = [
      {
        filterType: "LAUNGUAGE_SETTING",
        title: "言語設定",
        options: [],
        selected: [DEFAULT_LANGUAGE]
      },
      {
        filterType: "SORT_BY",
        title: "並び順",
        options: [
          { "name": "Relevance_name", value: "Relevance_value" },
          { "name": "name", value: "value" },
        ],
        selected: [DEFAULT_SORT_ATTRIBUTE, DEFAULT_SORT_ORDER]
      },
      {
        filterType: "SELECT_MULTI_STRING",
        title: "BOX_TEST",
        options: [
          { "name": "ボックス1", value: "" },
          { "name": "ボックス2", value: "" },
          { "name": "ボックス3", value: "" },
          { "name": "ボックス4", value: "" },
        ],
        selected: [true, true, true, true]
      },
      {
        filterType: "RANGE_NUM",
        title: "RANGE_NUM",
        options: [
          { "name": "min", value: "100" },
          { "name": "max", value: "200" }
        ],
        selected: [100, 200]
      },
      {
        filterType: "RANGE_DATE",
        title: "RANGE_DATE",
        options: [],
        selected: [new Date(2020, 8, 21, 21, 10, 5), new Date(Date.now())]
      },
      {
        filterType: "CONTAIN_STRING",
        title: "CONTAIN_STRING",
        options: [],
        selected: ["a", "b", "cc"]
      }
    ]
    setFilterOptions(tmpFilterOption)


    const tmphistory: Conversation[] = [
      {
        conversationType: "HUMAN_KENDRA",
        userInput: { "word": "首相" },
        userQuery: {
          IndexId: "indexId",
          PageNumber: 1,
          PageSize: 10,
          QueryText: "首相",
          AttributeFilter: {
            AndAllFilters: [
              {
                EqualsTo: {
                  Key: "_language_code",
                  Value: {
                    "StringValue": "ja"
                  }
                }
              }
            ]
          }
        },
        kendraResponse: {
          "$metadata": {
            "httpStatusCode": 200,
            "requestId": "f4bb9924-424e-4a13-a0ff-ed8330054210",
            "attempts": 1,
            "totalRetryDelay": 0
          },
          "FacetResults": [
            {
              "DocumentAttributeKey": "_data_source_id",
              "DocumentAttributeValueCountPairs": [
                {
                  "Count": 163,
                  "DocumentAttributeValue": {
                    "StringValue": "68ce80bd-df1a-45ca-b096-fcb5add21a72"
                  }
                },
                {
                  "Count": 3,
                  "DocumentAttributeValue": {
                    "StringValue": "69d50512-bf7b-43e8-a3a1-58c0064d5fcf"
                  }
                }
              ],
              "DocumentAttributeValueType": "STRING_VALUE"
            }
          ],
          "FeaturedResultsItems": [
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマトのタネ.txt"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [],
                "Text": "トマトのタネ"
              },
              "DocumentId": "s3://aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマトのタネ.txt",
              "DocumentTitle": {
                "Highlights": [],
                "Text": "トマトのタネ"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマトのタネ.txt",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-e0657794-6266-4275-b5c0-12c781545b78",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-e0657794-6266-4275-b5c0-12c781545b78",
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマト初心者栽培キット.txt"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [],
                "Text": "トマト栽培キット"
              },
              "DocumentId": "s3://aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマト初心者栽培キット.txt",
              "DocumentTitle": {
                "Highlights": [],
                "Text": "トマト初心者栽培キット"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/aws-whitepaper-kendra-ysekiy-20220728/商品ページ/トマト初心者栽培キット.txt",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-60a45d5b-80f9-4a0c-ac6c-109d07408fa0",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-60a45d5b-80f9-4a0c-ac6c-109d07408fa0",
              "Type": "DOCUMENT"
            }
          ],
          "QueryId": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9",
          "ResultItems": [
            {
              "AdditionalAttributes": [
                {
                  "Key": "QuestionText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 7,
                          "EndOffset": 13,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Amazon Kendraとは?"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                },
                {
                  "Key": "AnswerText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 7,
                          "EndOffset": 13,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 54,
                          "EndOffset": 60,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 409,
                          "EndOffset": 415,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 451,
                          "EndOffset": 457,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Amazon Kendra は、機械学習を利用した、非常に正確で使いやすいエンタープライズ検索サービスです。Kendra を使用すると、開発者はアプリケーションに検索機能を追加できるため、エンドユーザーは会社全体に分散する膨大なコンテンツに保存されている情報を発見できます。これには、マニュアル、調査レポート、FAQ、人事文書、カスタマーサービスガイドのデータが含まれており、ファイルシステム、ウェブサイト、Box、DropBox、Salesforce、SharePoint、リレーショナルデータベース、Amazon S3 などのさまざまなシステムにあります。 質問を入力すると、サービスは機械学習アルゴリズムを使用してコンテキストを理解し、正確な回答であれドキュメント全体であれ、最も関連性の高い結果を返します。たとえば、企業のクレジットカードの現金報酬はいくらですか?などの質問をすることができます。と入力すると、Kendra は関連ドキュメントにマッピングし、2%のような具体的な回答を返します。Kendra はサンプルコードを提供しているため、すぐに使い始めることができ、精度の高い検索を新規または既存のアプリケーションに簡単に統合できます。"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                }
              ],
              "DocumentAttributes": [],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 0,
                    "EndOffset": 300,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Amazon Kendra は、機械学習を利用した、非常に正確で使いやすいエンタープライズ検索サービスです。Kendra を使用すると、開発者はアプリケーションに検索機能を追加できるため、エンドユーザーは会社全体に分散する膨大なコンテンツに保存されている情報を発見できます。これには、マニュアル、調査レポート、FAQ、人事文書、カスタマーサービスガイドのデータが含まれており、ファイルシステム、ウェブサイト、Box、DropBox、Salesforce、SharePoint、リレーショナルデータベース、Amazon S3 などのさまざまなシステムにあります。 質問を入力すると、サービスは機械学習ア"
              },
              "DocumentId": "3e1cb27b723e4a553cb7d675b2dcf7f05b82c48e07710c25614422e78a33d3431679539516555",
              "DocumentTitle": {
                "Text": ""
              },
              "DocumentURI": "",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-1926a8c5-aa5f-4d23-abf4-6e27165acf3e",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-1926a8c5-aa5f-4d23-abf4-6e27165acf3e",
              "ScoreAttributes": {
                "ScoreConfidence": "VERY_HIGH"
              },
              "Type": "QUESTION_ANSWER"
            },
            {
              "AdditionalAttributes": [
                {
                  "Key": "QuestionText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 7,
                          "EndOffset": 13,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Amazon Kendra はどのコネクタをサポートしていますか?"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                },
                {
                  "Key": "AnswerText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 7,
                          "EndOffset": 13,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Amazon Kendra は現在、Amazon S3、SharePoint Online、ServiceNow、Salesforce、RDS、OneDrive、Confluence オンプレミスおよびクラウドバージョン用のコネクタを提供しています。Web クローラー、ファイルシステム、Google ドライブ、Jira など、さらに多くの機能をリリースする予定です。"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                }
              ],
              "DocumentAttributes": [],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 0,
                    "EndOffset": 184,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Amazon Kendra は現在、Amazon S3、SharePoint Online、ServiceNow、Salesforce、RDS、OneDrive、Confluence オンプレミスおよびクラウドバージョン用のコネクタを提供しています。Web クローラー、ファイルシステム、Google ドライブ、Jira など、さらに多くの機能をリリースする予定です。"
              },
              "DocumentId": "5676fdbb5b7c67b5e2cc6056dc3c186b2bcb3026eee48bf32a375acb741987af1679539516555",
              "DocumentTitle": {
                "Text": ""
              },
              "DocumentURI": "",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-96a59f98-e9a0-42ee-bdd5-8c2b8a5eefac",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-96a59f98-e9a0-42ee-bdd5-8c2b8a5eefac",
              "ScoreAttributes": {
                "ScoreConfidence": "VERY_HIGH"
              },
              "Type": "QUESTION_ANSWER"
            },
            {
              "AdditionalAttributes": [
                {
                  "Key": "QuestionText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 0,
                          "EndOffset": 6,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Kendra はどこでデータをインデックスしていますか?"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                },
                {
                  "Key": "AnswerText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 7,
                          "EndOffset": 13,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 66,
                          "EndOffset": 72,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 132,
                          "EndOffset": 138,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 223,
                          "EndOffset": 229,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 392,
                          "EndOffset": 398,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 518,
                          "EndOffset": 524,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 590,
                          "EndOffset": 596,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 640,
                          "EndOffset": 646,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Amazon Kendra は、データ保護に関する規制やガイドラインを含む AWS の責任共有モデルに準拠しています。Amazon Kendra リソースを作成する前に、AWS ID およびアクセス管理 (IAM) ポリシーを作成する必要があります。Amazon Kendra コンソールでは、新しい IAM ロールを作成したり、使用する IAM の既存のロールを選択したりできます。作成されたインデックスはクラウドに保存されます。Amazon Kendra は、移動中と保存中のデータを暗号化します。保存時には、選択した暗号化キーを使用します。次のいずれかを選択できます:AWS が所有するカスタマーマスターキー (CMK)。暗号化キーを指定しない場合、データはこのキーでデフォルトで暗号化されます。アカウントの AWS 管理 CMK、顧客管理 CMK です。動作中、Amazon Kendra は HTTPS プロトコルを使用してクライアントアプリケーションと通信します。HTTPS と AWS の署名を使用して、アプリケーションに代わって他のサービスと通信します (公開された API 呼び出しでネットワーク経由で Amazon Kendra にアクセスするには、クライアントがサポートする必要があるトランスポート層セキュリティ (TLS) を使用します)。詳細については、Kendra の開発者ガイドをご覧ください。https://docs.aws.amazon.com/kendra/latest/dg/security.html"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                }
              ],
              "DocumentAttributes": [],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 0,
                    "EndOffset": 300,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Amazon Kendra は、データ保護に関する規制やガイドラインを含む AWS の責任共有モデルに準拠しています。Amazon Kendra リソースを作成する前に、AWS ID およびアクセス管理 (IAM) ポリシーを作成する必要があります。Amazon Kendra コンソールでは、新しい IAM ロールを作成したり、使用する IAM の既存のロールを選択したりできます。作成されたインデックスはクラウドに保存されます。Amazon Kendra は、移動中と保存中のデータを暗号化します。保存時には、選択した暗号化キーを使用します。次のいずれかを選択できます:AWS が所有するカスタマ"
              },
              "DocumentId": "5121c228d22aec543c264509025b69305968d72dd122a834a2ae1b3991ed1e791679539516555",
              "DocumentTitle": {
                "Text": ""
              },
              "DocumentURI": "",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-7166288a-5fa3-47fa-9575-67eb5db63002",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-7166288a-5fa3-47fa-9575-67eb5db63002",
              "ScoreAttributes": {
                "ScoreConfidence": "VERY_HIGH"
              },
              "Type": "QUESTION_ANSWER"
            },
            {
              "AdditionalAttributes": [
                {
                  "Key": "QuestionText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 0,
                          "EndOffset": 6,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "Kendra はカスタムコネクタをサポートしていますか?"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                },
                {
                  "Key": "AnswerText",
                  "Value": {
                    "TextWithHighlightsValue": {
                      "Highlights": [
                        {
                          "BeginOffset": 62,
                          "EndOffset": 68,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        },
                        {
                          "BeginOffset": 199,
                          "EndOffset": 205,
                          "TopAnswer": false,
                          "Type": "STANDARD"
                        }
                      ],
                      "Text": "お客様は独自のコネクタをゼロから作成でき、当社のパブリックAPIによってこれらのコネクタが機能するようになります。お客様は、Kendra と連携するように調整できるコネクタのポートフォリオを持つ AWS エンタープライズサーチパートナーを利用することもできます。独自のコネクタを構築する場合は、場合によってはクラウドでホストすることも、オンプレミスにインストールすることもできます。定期的に実行し、Kendra インデックス内のリポジトリ（Dropbox、SharePoint など）のドキュメントを同期する機能が必要です。コネクタを繰り返し実行すると、インクリメンタル・インジェストを実行できるはずです (すでにインデックスが作成されているドキュメントをプルすることはできません)。"
                    }
                  },
                  "ValueType": "TEXT_WITH_HIGHLIGHTS_VALUE"
                }
              ],
              "DocumentAttributes": [],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 0,
                    "EndOffset": 300,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "お客様は独自のコネクタをゼロから作成でき、当社のパブリックAPIによってこれらのコネクタが機能するようになります。お客様は、Kendra と連携するように調整できるコネクタのポートフォリオを持つ AWS エンタープライズサーチパートナーを利用することもできます。独自のコネクタを構築する場合は、場合によってはクラウドでホストすることも、オンプレミスにインストールすることもできます。定期的に実行し、Kendra インデックス内のリポジトリ（Dropbox、SharePoint など）のドキュメントを同期する機能が必要です。コネクタを繰り返し実行すると、インクリメンタル・インジェストを実行できるはず"
              },
              "DocumentId": "ba12c576f67ac1b39b3167728aff7e3b878f531aeaadeeb621f39ed0fa8f86ad1679539516555",
              "DocumentTitle": {
                "Text": ""
              },
              "DocumentURI": "",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-cfa0758e-4674-466b-b1ef-8651881a47a7",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-cfa0758e-4674-466b-b1ef-8651881a47a7",
              "ScoreAttributes": {
                "ScoreConfidence": "VERY_HIGH"
              },
              "Type": "QUESTION_ANSWER"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/what-is-kendra.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 59,
                    "EndOffset": 65,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 405,
                    "EndOffset": 411,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 723,
                    "EndOffset": 729,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1128,
                    "EndOffset": 1134,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1777,
                    "EndOffset": 1783,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1881,
                    "EndOffset": 1887,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1945,
                    "EndOffset": 1951,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "relevant word, snippet, or document for your query. Amazon Kendra uses machine\n                                             learning to improve search results over time. \n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Simplicity — Amazon Kendra provides a\n                                             console and API\n                                             for\n                                             managing the documents that you want to search. You can use a\n                                             simple search API to integrate Amazon Kendra into your client applications, such\n                                             as websites or mobile applications.\n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Connectivity —\n                                             Amazon Kendra\n                                             can connect to\n                                             third-party\n                                             data sources to provide search across documents\n                                             managed\n                                             in different environments.\n                                          \n\n                                          \n                                       \n\n\n                                 \n\n                                 \n                                  \n                                 \n                                 Amazon Kendra Developer Edition\n\n                                 \n                                 The Amazon Kendra Developer Edition provides all of the features of Amazon Kendra"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/what-is-kendra.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 24,
                    "EndOffset": 30,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 41,
                    "EndOffset": 47,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "What\n         is Amazon Kendra? - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/what-is-kendra.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-218e1e18-c1a2-4320-bc3a-f6f5869d4793",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-218e1e18-c1a2-4320-bc3a-f6f5869d4793",
              "ScoreAttributes": {
                "ScoreConfidence": "HIGH"
              },
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 54,
                    "EndOffset": 60,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 347,
                    "EndOffset": 353,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 542,
                    "EndOffset": 548,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 557,
                    "EndOffset": 563,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 698,
                    "EndOffset": 704,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 739,
                    "EndOffset": 745,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 780,
                    "EndOffset": 786,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 809,
                    "EndOffset": 815,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 896,
                    "EndOffset": 902,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "The following topics show you how to configure Amazon Kendra\n                                    to meet\n                                    your security and compliance objectives. You also learn how to use other AWS services\n                                    that\n                                    help you to monitor and secure your Amazon Kendra resources. \n                                 \n\n                                 \n                                    Topics\n\n                                    \tData protection in Amazon Kendra\n\tAmazon Kendra and interface VPC endpoints\n                                             (AWS PrivateLink)\n\tIdentity and access management for Amazon Kendra\n\tLogging and monitoring in Amazon Kendra\n\tCompliance validation for Amazon Kendra\n\tResilience in Amazon Kendra\n\tInfrastructure security in\n                                             Amazon Kendra\n\n\n                                 \n\n                                 \n                              \n\n                              \n                                 \n                                    \n                                       \n                                          \n                                              Javascript is disabled or is unavailable in your\n                                                   browser.\n\n                                             To use the AWS Documentation, Javascript must be"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 19,
                    "EndOffset": 25,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 35,
                    "EndOffset": 41,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Security in Amazon Kendra - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-fc478d88-80a8-42a4-9c43-0bd087421d8b",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-fc478d88-80a8-42a4-9c43-0bd087421d8b",
              "ScoreAttributes": {
                "ScoreConfidence": "MEDIUM"
              },
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/how-it-works.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 219,
                    "EndOffset": 225,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 486,
                    "EndOffset": 492,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 752,
                    "EndOffset": 758,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1381,
                    "EndOffset": 1387,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "AWSDocumentationAmazon KendraDeveloper Guide\n\n                           \n                              \n                                 \n                                 How\n                                    Amazon Kendra\n                                    works\n                                 \n\n                                 \n                                    \n                                    \n                                 \n\n                                 Amazon Kendra provides an interface for\n                                    indexing\n                                    and\n                                    searching\n                                    documents.\n                                    You can use Amazon Kendra to create an updatable\n                                    index\n                                    of documents of a variety of types, including plain text, HTML files,\n                                    Microsoft Word documents, Microsoft PowerPoint presentations, and PDF files. It has\n                                    a search\n                                    API that you can use from a variety of client applications, such as\n                                    websites\n                                    or mobile applications. \n                                 \n\n                                  Amazon Kendra has the following components:\n\n                                 \n                                     \n                                     \n                                     \n                                     \n                                    \n                                    \t\n                                          \n                                          The index,\n                                             which provides a search API for client queries. You create the"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/how-it-works.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 20,
                    "EndOffset": 26,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 51,
                    "EndOffset": 57,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "How\n         Amazon Kendra\n         works - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/how-it-works.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-d0121c62-81cc-47a5-867b-6d4b4c56ac3d",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-d0121c62-81cc-47a5-867b-6d4b4c56ac3d",
              "ScoreAttributes": {
                "ScoreConfidence": "MEDIUM"
              },
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/setup.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 255,
                    "EndOffset": 261,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 459,
                    "EndOffset": 465,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 644,
                    "EndOffset": 650,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 670,
                    "EndOffset": 676,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "AWSDocumentationAmazon KendraDeveloper Guide\n\n                           Sign up for AWSRegions and endpoints\n\n                           \n                              \n                                 \n                                 Setting up Amazon Kendra\n\n                                 \n                                    \n                                    \n                                 \n\n                                 Before using Amazon Kendra, you must have an Amazon Web Services (AWS) account. After\n                                    you have an AWS\n                                    account, you can access Amazon Kendra through the Amazon Kendra console, the AWS Command\n                                    Line Interface (AWS CLI), or\n                                    the AWS SDKs.\n                                 \n\n                                 This guide includes examples for AWS CLI, Java, and Python.\n\n                                 \n                                    Topics\n\n                                    \tSign up for AWS\n\tRegions and endpoints\n\tSetting up the AWS CLI\n\tSetting up the AWS SDKs\n\n\n                                 \n\n                                 \n                                 Sign up for AWS\n\n                                 \n                                 When you sign up for Amazon Web Services (AWS), your account is automatically signed"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/setup.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 18,
                    "EndOffset": 24,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 34,
                    "EndOffset": 40,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Setting up Amazon Kendra - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/setup.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-361332cb-085a-47c4-9b72-a71761dc7dc7",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-361332cb-085a-47c4-9b72-a71761dc7dc7",
              "ScoreAttributes": {
                "ScoreConfidence": "MEDIUM"
              },
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/deploying.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 78,
                    "EndOffset": 84,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 783,
                    "EndOffset": 789,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1688,
                    "EndOffset": 1694,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "components. This is where you will integrate your application with the Amazon Kendra\n                                             API.\n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Search bar – this is the component where a user enters a search term and\n                                             that calls the search function.\n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Results – this is the component that displays the results from Amazon Kendra.\n                                             It has three components: Suggested answers, FAQ results, and recommended\n                                             documents.\n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Facets – This is the component that shows the facets in the search\n                                             results and enables you to choose a facet to limit the search.\n                                          \n\n                                          \n                                       \n\t\n                                          \n                                          Pagination – this is the component that paginates the response from\n                                             Amazon Kendra.\n                                          \n\n                                          \n                                       \n\n\n                                 \n\n                                  \n                                 \n                                 Prerequisites\n\n                                 \n                                 Before you begin you need the following:"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/deploying.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 17,
                    "EndOffset": 23,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 33,
                    "EndOffset": 39,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "Deploying Amazon Kendra - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/deploying.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-91fc1ac8-e663-4ca4-b4aa-a32a82eb0f76",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-91fc1ac8-e663-4ca4-b4aa-a32a82eb0f76",
              "ScoreAttributes": {
                "ScoreConfidence": "MEDIUM"
              },
              "Type": "DOCUMENT"
            },
            {
              "AdditionalAttributes": [],
              "DocumentAttributes": [
                {
                  "Key": "_source_uri",
                  "Value": {
                    "StringValue": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security_iam_service-with-iam.html"
                  }
                }
              ],
              "DocumentExcerpt": {
                "Highlights": [
                  {
                    "BeginOffset": 80,
                    "EndOffset": 86,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 150,
                    "EndOffset": 156,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 303,
                    "EndOffset": 309,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 321,
                    "EndOffset": 327,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 509,
                    "EndOffset": 515,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 824,
                    "EndOffset": 830,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 941,
                    "EndOffset": 947,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1060,
                    "EndOffset": 1066,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1360,
                    "EndOffset": 1366,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 1444,
                    "EndOffset": 1450,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "AWSDocumentationAmazon KendraDeveloper Guide\n\n                           Amazon Kendra\n                                 identity-based policiesAmazon Kendra\n                                 Resource-based policiesAccess control lists (ACLs)Authorization based on\n                                 Amazon Kendra tagsAmazon Kendra IAM\n                                 Roles\n\n                           \n                              \n                                 \n                                 How Amazon Kendra works with\n                                    IAM\n                                 \n\n                                 \n                                    \n                                    \n                                 \n\n                                 Before you use IAM to manage access to Amazon Kendra, you should understand what\n                                    IAM features are available to use with Amazon Kendra. To get a high-level view of\n                                    how\n                                    Amazon Kendra and other AWS services work with IAM, see AWS Services That\n                                       Work with IAM in the IAM User Guide.\n                                 \n\n                                 \n                                    Topics\n\n                                    \tAmazon Kendra\n                                             identity-based policies\n\tAmazon Kendra"
              },
              "DocumentId": "s3://amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security_iam_service-with-iam.html",
              "DocumentTitle": {
                "Highlights": [
                  {
                    "BeginOffset": 11,
                    "EndOffset": 17,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  },
                  {
                    "BeginOffset": 51,
                    "EndOffset": 57,
                    "TopAnswer": false,
                    "Type": "STANDARD"
                  }
                ],
                "Text": "How Amazon Kendra works with\n         IAM - Amazon Kendra"
              },
              "DocumentURI": "https://s3.us-east-1.amazonaws.com/amazon-kendra-sample-docs-us-east-1/documents/kendra/latest/dg/security_iam_service-with-iam.html",
              "FeedbackToken": "AYADeCOpVRMcn74yp2vM3kbOdrkAXwABABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFsejBDV1k0R010RzIzZFBuYTIxcC9Tc0RUZDFLNk1UVXM3WGlIY1krUFNZSkorYm15aURoeU96MjdWcmNvL0ZpUT09AAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3OTQyODk5MjcwNzA6a2V5LzA4YjVkYTRmLWQyOWEtNDU3Mi04OTAwLTRkZjMzN2VjYzljYwC4AQIBAHj0zQzhkrLuQ7zD8HaKUpTKx0B1ZhTxova5poogpTSq9gEhqsV7yJxfqKr0ytlvehOzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMiwuLOTt9Bbvp728wAgEQgDsAeEMGjJAujypAgmK86yhyxTTYF0mKRfQ8kynLjXSaA6D9m5G2JSUG7f-gu_QW3AXxJZeUUPQpk1fxOAIAAAAADAAAEAAAAAAAAAAAAAAAAAC_Sji34s8_ImHH36LQcI1t_____wAAAAEAAAAAAAAAAAAAAAEAAAF2NFufWTIepWUxFxqCwbQE0eYYewGijWOCoUQwN76T5RME61WWQF7vxghKmCmzXDtBjB_knIm6IhxLDiAizHpQCRvMjt1tMv9uzS1z_Md7ZtreqVYVdH_ORWTu-clVNyPupzzRc2N9BQe33ug0U007hzyytdUnDmgOtosjda-JkG5jeOHM-QX9aEYJvQR-Bzu2d5Nccl8JHSeOzGFAiVrEgDSofOsReLTe9FClaukKZ1Sp1bCFK2A_-l3q8r24WmEiRVGslfLgKNjkpu4E9WuDQ8M3UYKqZWe30DDNSUp5Ge-VxSRBxWErkfdwlIA80Fuo-q-ey3mSxAMmN5HQfdkGano6qBp_bgpy99vmmAFqw0k0xQplOzjshUWNAD808-0W_7sjj8ckFqOj1ImfzBSLahytE2v7GsGmwkcR4bfPkdodKscWlMd3ZSHnsUECNcfMaMzZ5L_rM52ETCd7KkpcpezgCMUn0yxo1qG15CLyBGqkTyWdy5_ouqNhNcaINyHfxMvKfiS7AGcwZQIwTex7-z9mZwTpfPhbmeSSDtuC40BOtKgFlj10RGpcCun3e6D_c1ZR8ae-RMekZ664AjEApMqKQj4wLcmTqpOP3rpFQiZF0P1Hbc5begmlwA5lB304kkNqqUNrmUkftEvRRtPK.1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-b4f3471e-b2d9-4490-8cd8-8b8860b82744",
              "Format": "TEXT",
              "Id": "1c5dfec8-f334-4dd6-b5ec-345c67c4c3c9-b4f3471e-b2d9-4490-8cd8-8b8860b82744",
              "ScoreAttributes": {
                "ScoreConfidence": "MEDIUM"
              },
              "Type": "DOCUMENT"
            }
          ],
          "TotalNumberOfResults": 170
        },
        aiResponse: undefined
      },
      {
        conversationType: "HUMAN_AI",
        userInput: { word: "こんばんは" },
        userQuery: undefined,
        kendraResponse: undefined,
        aiResponse: {
          userUtterance: "こんばんは",
          aiUtterance: "よるですね",
          actualPrompt: "AIさん、こんばんは",
          memory: { "入力以前のやりとり": "any" },
          usedTemplatePrompt: "AIさん、{userinput}",
          promptVariables: { "userinput": "こんばんは" },
          llmParam: { "LLM parameter": "any" },
        }
      },
      {
        conversationType: "HUMAN",
        userInput: { word: "こんばんは" },
        userQuery: undefined,
        kendraResponse: undefined,
        aiResponse: undefined
      }
    ]
    setHistory(tmphistory)
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
      {/* API通信用のモック */}
      <AuthMock indexId={indexId} kendraClient={kendraClient} ></AuthMock>
      {/* 検索画面 */}
      <GlobalContext.Provider value={{ history: history, setHistory: setHistory, filterOptions: filterOptions, setFilterOptions: setFilterOptions }}>
        <TopBar />
        <SideBar>
          <InteractionArea />
        </SideBar>
      </GlobalContext.Provider>
    </>
  )
}

export default App
