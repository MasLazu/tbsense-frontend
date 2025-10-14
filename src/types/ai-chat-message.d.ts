import { AiChatContent } from "./ai-chat-content";

export interface AiChatMessage {
  order: number;
  role: "user" | "assistant" | "tool";
  content: AiChatContent;
  createdAt: string | null | undefined;
  responseId: string | null | undefined;
}
