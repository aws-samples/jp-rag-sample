import { Handler, Context } from 'aws-lambda';
import { PredictRequest } from 'jp-rag-sample';
import api from './utils/api';
import { defaultModel } from './utils/models';

declare global {
  namespace awslambda {
    function streamifyResponse(
      f: (
        event: PredictRequest,
        responseStream: NodeJS.WritableStream,
        context: Context
      ) => Promise<void>
    ): Handler;
  }
}

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const model = event.model || defaultModel;
    for await (const token of api.invokeStream?.(
      model,
      event.messages,
      event.id
    ) ?? []) {
      responseStream.write(token);
    }
    responseStream.end();
  }
);
