import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
  ServiceQuotaExceededException,
  ThrottlingException,
} from '@aws-sdk/client-bedrock-runtime';
import {
  ApiInterface,
  BedrockResponse,
  UnrecordedMessage,
} from 'jp-rag-sample';
import { BEDROCK_MODELS } from './models';

const client = new BedrockRuntimeClient({
  region: process.env.MODEL_REGION,
});

const createBodyText = (
  model: string,
  messages: UnrecordedMessage[],
  id: string
): string => {
  const modelConfig = BEDROCK_MODELS[model];
  return modelConfig.createBodyText(messages, id);
};

const extractOutputText = (model: string, body: BedrockResponse): string => {
  const modelConfig = BEDROCK_MODELS[model];
  return modelConfig.extractOutputText(body);
};

const bedrockApi: ApiInterface = {
  invoke: async (model, messages, id) => {
    const command = new InvokeModelCommand({
      modelId: model.modelId,
      body: createBodyText(model.modelId, messages, id),
      contentType: 'application/json',
    });
    const data = await client.send(command);
    const body = JSON.parse(data.body.transformToString());
    return extractOutputText(model.modelId, body);
  },
  invokeStream: async function* (model, messages, id) {
    try {
      const command = new InvokeModelWithResponseStreamCommand({
        modelId: model.modelId,
        body: createBodyText(model.modelId, messages, id),
        contentType: 'application/json',
      });
      const res = await client.send(command);

      if (!res.body) {
        return;
      }

      for await (const streamChunk of res.body) {
        if (!streamChunk.chunk?.bytes) {
          break;
        }
        const bytes = new TextDecoder('utf-8').decode(streamChunk.chunk?.bytes);
        const body = JSON.parse(bytes);
        const outputText = extractOutputText(model.modelId, body);
        if (outputText) {
          yield outputText;
        }
        if (body.stop_reason) {
          break;
        }
      }
    } catch (e) {
      if (
        e instanceof ThrottlingException ||
        e instanceof ServiceQuotaExceededException
      ) {
        yield 'ただいまアクセスが集中しているため時間をおいて試してみてください。';
      } else {
        yield 'エラーが発生しました。時間をおいて試してみてください。';
      }
    }
  },
};

export default bedrockApi;
