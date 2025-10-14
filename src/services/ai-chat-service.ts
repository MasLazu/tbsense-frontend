import { API_BASE_URL, apiClient } from "@/lib/api-client";
import type { AiChatSession } from "@/types/ai-chat-session";
import type { PaginatedResult, PaginationRequest } from "./plantations-service";

export class AiChatService {
  static async getSession(sessionId: string, accessToken?: string) {
    return (
      await apiClient.get<AiChatSession>(
        `/ai-agent/sessions/${sessionId}`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getSessionsPaginated(
    params: PaginationRequest,
    accessToken?: string
  ) {
    return (
      await apiClient.post<PaginatedResult<AiChatSession>>(
        `/ai-sessions/paginated`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getSessionWithMessages(sessionId: string, accessToken?: string) {
    return (
      await apiClient.get<AiChatSession>(
        `/ai-sessions/${sessionId}/with-chats`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async startNewSession(
    payload: { sessionId: string; chatMessage: string; model: string },
    accessToken?: string
  ) {
    return await fetch(`${API_BASE_URL}/ai-sessions/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  }

  static async sendNewMessage(
    payload: { sessionId: string; message: string; model: string },
    accessToken?: string
  ) {
    const payloadBackend = {
      sessionId: payload.sessionId,
      chatMessage: payload.message,
      model: payload.model,
    };
    return await fetch(`${API_BASE_URL}/ai-sessions/continue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payloadBackend),
    });
  }
}
