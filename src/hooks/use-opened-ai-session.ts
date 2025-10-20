import { useQuery, useQueryClient } from "@tanstack/react-query";

export const OPENED_AI_SESSION_KEY = ["opened-ai-session"] as const;

export function useOpenedAiSession() {
  const queryClient = useQueryClient();

  const { data: sessionId = null } = useQuery<string | null>({
    queryKey: OPENED_AI_SESSION_KEY,
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSession = (sessionId: string | null) => {
    queryClient.setQueryData(OPENED_AI_SESSION_KEY, sessionId);
  };

  return {
    sessionId,
    setSession,
  };
}
