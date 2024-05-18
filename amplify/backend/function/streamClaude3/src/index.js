// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  ServiceQuotaExceededException,
  ThrottlingException,
} = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient();


const extractOutputTextClaude3Message = (body) => {
  if (body.type === 'message') {
    return body.content[0].text;
  } else if (body.type === 'content_block_delta') {
    return body.delta.text;
  }
  return '';
};

async function* invokeStream(input) {
  try {
    
    const command = new InvokeModelWithResponseStreamCommand(input);
    
    const res = await client.send(command);

    if (!res.body) {
      return;
    }

    for await (const streamChunk of res.body) {
      if (!streamChunk.chunk?.bytes) {
        break;
      }
      const body = JSON.parse(
        new TextDecoder('utf-8').decode(streamChunk.chunk?.bytes)
      );
      const outputText = extractOutputTextClaude3Message(body);
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
      console.log(e)
      yield 'エラーが発生しました。時間をおいて試してみてください。';
    }
  }
}

exports.handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    for await (const token of invokeStream?.(event.body) ?? []) {
      responseStream.write(token);
    }
    responseStream.end();
  }
);