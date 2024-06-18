// Claude Message
// https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
export type ClaudeMessageParams = {
  system?: string;
  anthropic_version?: string;
  messages?: {
    role: string;
    content: {
      type: string;
      text?: string;
      source?: {
        type: string;
        media_type: string;
        data: string;
      };
    }[];
  }[];
  max_tokens?: number;
  stop_sequences?: string[];
  temperature?: number;
  top_k?: number;
  top_p?: number;
};

export type BedrockResponse = {
  // Claude
  completion: string;
  type: string;
  // ClaudeMessage Non-stream
  content: {
    type: string;
    text: string;
  }[];
  // ClaudeMessage Stream
  delta: {
    text: string;
  };
};
