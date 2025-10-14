import { useQuery, useQueryClient } from "@tanstack/react-query";

const AI_CHAT_SIDEBAR_VISIBILITY_KEY = ["ai-chat-sidebar-visibility"] as const;

export function useAiChatSidebarVisibility() {
  const queryClient = useQueryClient();

  const { data: isOpen = false } = useQuery({
    queryKey: AI_CHAT_SIDEBAR_VISIBILITY_KEY,
    queryFn: () => false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const openChat = () => {
    queryClient.setQueryData(AI_CHAT_SIDEBAR_VISIBILITY_KEY, true);
  };

  const closeChat = () => {
    queryClient.setQueryData(AI_CHAT_SIDEBAR_VISIBILITY_KEY, false);
  };

  const toggleChat = () => {
    queryClient.setQueryData(AI_CHAT_SIDEBAR_VISIBILITY_KEY, !isOpen);
  };

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
  };
}
