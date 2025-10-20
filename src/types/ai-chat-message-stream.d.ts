import type { AiChatContentStream } from "./ai-chat-content-stream";

export interface AiChatMessageStream {
  authorName: string | null;
  role: string;
  contents: AiChatContentStream[];
  additionalProperties: any | null;
  responseId: string;
  messageId: string | null;
  conversationId: string | null;
  createdAt: string;
  finishReason: string | null;
  modelId: string;
}
