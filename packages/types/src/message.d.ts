export type Role = 'system' | 'user' | 'assistant';

export type Model = {
  type: 'bedrock' | 'bedrockAgent' | 'sagemaker';
  modelId: string;
  sessionId?: string;
};

export type UnrecordedMessage = {
  role: Role;
  content: string;
  llmType?: string;
};
