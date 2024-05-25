import {
  BedrockResponse,
  ClaudeMessageParams,
  Model,
  UnrecordedMessage,
} from 'jp-rag-sample';

// Default Models
const modelId: string = JSON.parse(process.env.MODEL_IDS || '[]')
  .map((name: string) => name.trim())
  .filter((name: string) => name)[0]!;

export const defaultModel: Model = {
  type: 'bedrock',
  modelId: modelId,
};

// Model Params

const CLAUDE_MESSAGE_DEFAULT_PARAMS: ClaudeMessageParams = {
  max_tokens: 3000,
  temperature: 0.1,
  top_k: 300,
  top_p: 0.8,
};
export type ClaudeMessageParamsUsecases = Record<string, ClaudeMessageParams>;
const CLAUDE_MESSAGE_USECASE_PARAMS: ClaudeMessageParamsUsecases = {
  '/rag': {
    temperature: 0.0,
  },
};

// Model Config

const createBodyTextClaudeMessage = (
  messages: UnrecordedMessage[],
  id: string
) => {
  const system = messages.find((message) => message.role === 'system');
  messages = messages.filter((message) => message.role !== 'system');
  const body: ClaudeMessageParams = {
    anthropic_version: 'bedrock-2023-05-31',
    system: system?.content,
    messages: messages.map((message) => {
      return {
        role: message.role,
        content: [{ type: 'text', text: message.content }],
      };
    }),
    ...CLAUDE_MESSAGE_DEFAULT_PARAMS,
    ...CLAUDE_MESSAGE_USECASE_PARAMS[id],
  };
  return JSON.stringify(body);
};

const extractOutputTextClaudeMessage = (body: BedrockResponse): string => {
  if (body.type === 'message') {
    return body.content[0].text;
  } else if (body.type === 'content_block_delta') {
    return body.delta.text;
  }
  return '';
};

export const BEDROCK_MODELS: {
  [key: string]: {
    createBodyText: (messages: UnrecordedMessage[], id: string) => string;
    extractOutputText: (body: BedrockResponse) => string;
  };
} = {
  'anthropic.claude-3-opus-20240229-v1:0': {
    createBodyText: createBodyTextClaudeMessage,
    extractOutputText: extractOutputTextClaudeMessage,
  },
  'anthropic.claude-3-sonnet-20240229-v1:0': {
    createBodyText: createBodyTextClaudeMessage,
    extractOutputText: extractOutputTextClaudeMessage,
  },
  'anthropic.claude-3-haiku-20240307-v1:0': {
    createBodyText: createBodyTextClaudeMessage,
    extractOutputText: extractOutputTextClaudeMessage,
  },
};
