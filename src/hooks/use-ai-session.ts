import { useQuery } from "@tanstack/react-query";
import { AiChatService } from "../services/ai-chat-service";
import type {
  PaginatedResult,
  PaginationRequest,
} from "@/services/plantations-service";
import { useAuth } from "./use-auth";
import type { AiChatSession } from "@/types/ai-chat-session";

export const aiSessionKeys = {
  all: () => ["ai-session"] as const,
  session: (sessionId: string) => [...aiSessionKeys.all(), sessionId] as const,
  paginated: (params: PaginationRequest) =>
    [...aiSessionKeys.all(), "paginated", params] as const,
};

export function useAiSession(sessionId: string, enabled: boolean = true) {
  const { accessToken } = useAuth();

  return useQuery<AiChatSession>({
    queryKey: aiSessionKeys.session(sessionId),
    queryFn: () => AiChatService.getSession(sessionId, accessToken),
    enabled: enabled && !!sessionId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAiSessionsPaginated(
  params: PaginationRequest,
  enabled: boolean = true
) {
  const { accessToken } = useAuth();

  return useQuery<PaginatedResult<AiChatSession>>({
    queryKey: aiSessionKeys.paginated(params),
    queryFn: () => AiChatService.getSessionsPaginated(params, accessToken),
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
