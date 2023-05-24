import { KendraClient, SubmitFeedbackCommand } from "@aws-sdk/client-kendra";
import { S3Client } from "@aws-sdk/client-s3";
import { CREDENTIALS_FILE_NAME, CREDENTIALS_FILE_PATH } from "./constants";

const _loadingErrors = [];

// If you get an error here, please revisit the Getting Started section of the README
let config = null;
try {
  const response = await fetch(`./${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  config = await response.json();
} catch (e) {
  console.log(e);
  _loadingErrors.push(
    `${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME} could not be loaded. See Getting Started in the README.`
  );
}

if (config) {
  if (!config.accessKeyId) {
    _loadingErrors.push(
      `There is no accessKeyId provided in${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME}`
    );
  }
  if (!config.secretAccessKey) {
    _loadingErrors.push(
      `There is no secretAccessKey provided in ${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME}`
    );
  }
  if (!config.region) {
    _loadingErrors.push(
      `There is no region provided in ${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME}`
    );
  }
  if (!config.indexId || config.indexId.length === 0) {
    _loadingErrors.push(
      `There is no indexId provided in ${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME}`
    );
  }
}

const hasErrors = _loadingErrors.length > 0;
if (hasErrors) {
  console.error(JSON.stringify(_loadingErrors));
}

export const initAWSError = _loadingErrors;

export const indexId = config ? config.indexId : undefined;

export const kendraClient = !hasErrors
  ? new KendraClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    }
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

  await kendraClient?.send(command).then(
    (data) => {
      console.log(`[DEBUG success]: ${data}`);
    },
    (error) => {
      console.log(`[DEBUG error]: ${error}`);
    }
  )
}

export const s3Client = !hasErrors
  ? new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    }
  })
  : undefined;
