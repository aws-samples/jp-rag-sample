import { AttributeFilter, KendraClient, QueryCommand, QueryCommandInput, SortingConfiguration, SubmitFeedbackCommand } from "@aws-sdk/client-kendra";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const _loadingErrors = [];

if (!import.meta.env.VITE_ACCESS_KEY_ID) {
  _loadingErrors.push(
    "環境変数にACCESS_KEY_IDがありません"
  );
}
if (!import.meta.env.VITE_SECRET_ACCESS_KEY) {
  _loadingErrors.push(
    "環境変数にSECRET_ACCESS_KEYがありません"
  );
}
if (!import.meta.env.VITE_REGION) {
  _loadingErrors.push(
    "環境変数にREGIONがありません"
  );
}
if (!import.meta.env.VITE_INDEX_ID) {
  _loadingErrors.push(
    "環境変数にINDEX_IDがありません"
  );
}
if (!import.meta.env.VITE_SERVER_URL) {
  _loadingErrors.push(
    "環境変数にSERVER_URLがありません"
  );
}

const hasErrors = _loadingErrors.length > 0;
if (hasErrors) {
  console.error(JSON.stringify(_loadingErrors));
}

export const initAWSError: string[] = _loadingErrors;

const accessKeyId: string = import.meta.env.VITE_ACCESS_KEY_ID ?? ""
const secretAccessKey = import.meta.env.VITE_SECRET_ACCESS_KEY ?? ""
const region = import.meta.env.VITE_REGION ?? ""
export const indexId: string = import.meta.env.VITE_INDEX_ID ?? ""
export const serverUrl: string = import.meta.env.VITE_SERVER_URL ?? ""

export const kendraClient = !hasErrors
  ? new KendraClient({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    endpoint: `${serverUrl}/v2/kendra/`,
  })
  : undefined;

export enum Relevance {
  Relevant = "RELEVANT",
  NotRelevant = "NOT_RELEVANT",
  Click = "CLICK",
}

export async function submitFeedback(
  relevance: Relevance, // feedbackする関連度
  resultId: string, // feedbackするアイテム
  queryId: string // Query id
) {

  const command = (relevance === Relevance.Click)
    ? new SubmitFeedbackCommand({
      IndexId: indexId,
      QueryId: queryId,
      ClickFeedbackItems: [
        {
          ResultId: resultId,
          ClickTime: new Date(),
        },
      ],
    })
    : new SubmitFeedbackCommand({
      IndexId: indexId,
      QueryId: queryId,
      RelevanceFeedbackItems: [
        {
          ResultId: resultId,
          RelevanceValue: relevance
        },
      ],
    });

  // Feedbackを送信
  await kendraClient?.send(command)
}

export function getKendraQuery(
  queryText: string,
  attributeFilter: AttributeFilter,
  sortingConfiguration: SortingConfiguration | undefined
): QueryCommandInput {
  return {
    IndexId: indexId,
    PageNumber: 1,
    PageSize: 10,
    QueryText: queryText,
    AttributeFilter: attributeFilter,
    SortingConfiguration: sortingConfiguration,
  }
}

export function overwriteQuery(
  prevQuery: QueryCommandInput,
  newAttributeFilter: AttributeFilter,
  newSortingConfiguration: SortingConfiguration | undefined
): QueryCommandInput {
  return {
    ...prevQuery,
    AttributeFilter: newAttributeFilter,
    SortingConfiguration: newSortingConfiguration,
  }
}


export async function kendraQuery(param: QueryCommandInput) {
  const data = await kendraClient?.send(new QueryCommand(param))
  if (s3Client && data && data.ResultItems) {
    for await (const result of data.ResultItems) {
      if (result.DocumentURI) {
        try {
          let res = result.DocumentURI.split("/");
          if (res[2].startsWith("s3")) {

            // bucket名とkeyを取得
            let bucket = res[3];
            let key = res[4];
            for (var i = 5; i < res.length; i++) {
              key = key + "/" + res[i];
            }
            // s3 の presigned url に置き換え
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            await getSignedUrl(s3Client, command, { expiresIn: 3600 }).then((uri: string) => {
              result.DocumentURI = uri;
            });
          }
        } catch {
          // S3 以外はなにもしない (Just do nothing, so the documentURI are still as before)
        }
      }

    }
  }


  if (data && data.ResultItems) {
    for (const result of data.ResultItems) {
      if (s3Client && result.DocumentURI && result.DocumentTitle?.Text) {

      }
    }
  }


  return data;
}


export const s3Client = !hasErrors
  ? new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    }
  })
  : undefined;
