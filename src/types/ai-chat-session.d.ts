import { AiChatMessage } from "./ai-chat-message";

export interface AiChatSession {
  id: string | null;
  title: string | null;
  lastActiveAt: string | null;
  messages: AiChatMessage[] | null | undefined;
}
