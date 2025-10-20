import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AiChatService } from "../services/ai-chat-service";
import { uuidv7 } from "uuidv7";
import {
  OPENED_AI_SESSION_KEY,
  useOpenedAiSession,
} from "./use-opened-ai-session";
import type { AiChatMessageStream } from "../types/ai-chat-message-stream";
import { useState } from "react";
import { useAuth } from "./use-auth";
import type { AiChatSession } from "@/types/ai-chat-session";
import type { AiChatMessage } from "@/types/ai-chat-message";
import type { AiChatContentText } from "@/types/ai-chat-content";
import type {
  AiChatContentFunctionCallStream,
  AiChatContentFunctionResultStream,
} from "@/types/ai-chat-content-stream";

export const AiMessageKeys = {
  all: () => ["ai-message"] as const,
  session: (sessionId: string | null) =>
    [...AiMessageKeys.all(), sessionId] as const,
};

export function useAiMessage() {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { sessionId } = useOpenedAiSession();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: historyMessages } = useQuery<AiChatSession>({
    queryKey: AiMessageKeys.session(sessionId),
    queryFn: async () => {
      if (!sessionId) {
        return {
          id: null,
          title: "New Message",
          lastActiveAt: null,
          messages: [],
        };
      }

      const sessionData = await AiChatService.getSessionWithMessages(
        sessionId,
        accessToken
      );

      // Filter out empty assistant text messages
      const filteredMessages =
        sessionData.messages?.filter((msg) => {
          if (
            msg.role === "assistant" &&
            msg.content.$type === "text" &&
            !(msg.content as AiChatContentText).text?.trim()
          ) {
            return false;
          }
          return true;
        }) || [];

      return {
        ...sessionData,
        messages: filteredMessages,
      };
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    notifyOnChangeProps: "all",
  });

  const { mutate: sendFirstMessageMutate } = useMutation({
    mutationKey: AiMessageKeys.session(sessionId),
    mutationFn: async ({
      chatMessage,
      modelId,
    }: {
      chatMessage: string;
      modelId?: string;
    }) => {
      setIsStreaming(true);
      const newMessage: AiChatMessage = {
        order: 1,
        role: "user",
        content: {
          $type: "text",
          text: chatMessage,
          annotations: null,
          additionalProperties: null,
        } as AiChatContentText,
        createdAt: null,
        responseId: null,
      };

      const session: AiChatSession = {
        id: uuidv7(),
        title: "New Session",
        lastActiveAt: null,
        messages: [newMessage],
      };
      queryClient.setQueryData<AiChatSession>(
        AiMessageKeys.session(session.id),
        session
      );

      queryClient.setQueryData<string>(OPENED_AI_SESSION_KEY, session.id!);

      const response = await AiChatService.startNewSession(
        {
          sessionId: session.id!,
          chatMessage: chatMessage,
          model: modelId ?? "gemini-2.5-flash",
        },
        accessToken
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n").filter((l) => l.startsWith("data:"));
          const dataStr = lines.map((l) => l.slice(5).trim()).join("\n");

          parseAiMessageStream(
            JSON.parse(dataStr) as AiChatMessageStream,
            session,
            queryClient
          );
        }
      }
      await queryClient.refetchQueries({
        queryKey: AiMessageKeys.session(sessionId),
        exact: true,
      });
      setIsStreaming(false);
    },
  });

  const { mutate: sendMessageMutate } = useMutation({
    mutationKey: AiMessageKeys.session(sessionId),
    mutationFn: async ({
      message,
      sessionId,
      modelId,
    }: {
      message: string;
      sessionId: string;
      modelId?: string;
    }) => {
      setIsStreaming(true);

      const newMessage: AiChatMessage = {
        order: historyMessages!.messages!.length + 2,
        role: "user",
        content: {
          $type: "text",
          text: message,
          annotations: null,
          additionalProperties: null,
        } as AiChatContentText,
        createdAt: null,
        responseId: null,
      };

      queryClient.setQueryData<AiChatSession>(
        AiMessageKeys.session(sessionId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...(old?.messages || []), newMessage],
          };
        }
      );

      const response = await AiChatService.sendNewMessage(
        {
          sessionId: sessionId,
          message: message,
          model: modelId ?? "gemini-2.5-flash",
        },
        accessToken
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n").filter((l) => l.startsWith("data:"));
          const dataStr = lines.map((l) => l.slice(5).trim()).join("\n");

          parseAiMessageStream(
            JSON.parse(dataStr) as AiChatMessageStream,
            historyMessages!,
            queryClient
          );
        }
      }
      await queryClient.refetchQueries({
        queryKey: AiMessageKeys.session(sessionId),
        exact: true,
      });
      setIsStreaming(false);
    },
  });

  return {
    historyMessages,
    sendMessageMutate,
    sendFirstMessageMutate,
    isStreaming,
  };
}

function parseAiMessageStream(
  stream: AiChatMessageStream,
  aiChatSession: AiChatSession,
  queryClient: QueryClient
) {
  stream.contents.forEach((content) => {
    if (content.$type === "text") {
      const contentText = content as AiChatContentText;

      queryClient.setQueryData<AiChatSession>(
        AiMessageKeys.session(aiChatSession.id as string | null),
        (old) => {
          if (!old) return old;

          const messages = old.messages || [];

          const existingIndex = messages.findIndex(
            (m) =>
              m.responseId != null &&
              stream.responseId != null &&
              m.responseId === stream.responseId &&
              m.content.$type === "text"
          );

          if (existingIndex !== -1) {
            return {
              ...old,
              messages: messages.map((m, i) => {
                if (i !== existingIndex) return m;
                const oldContent = m.content as AiChatContentText;
                return {
                  ...m,
                  content: {
                    ...oldContent,
                    text: (oldContent.text || "") + contentText.text,
                  },
                };
              }),
            };
          }

          const nextOrder =
            (messages.reduce((max, mm) => Math.max(max, mm.order || 0), 0) ||
              0) + 1;

          const newMessage: AiChatMessage = {
            order: nextOrder,
            role: "assistant",
            content: { ...contentText },
            createdAt: stream.createdAt ?? new Date().toISOString(),
            responseId: stream.responseId,
          };

          return {
            ...old,
            messages: [...messages, newMessage],
          };
        }
      );
    } else if (content.$type === "functionCall") {
      const contentFunctionCall = content as AiChatContentFunctionCallStream;
      queryClient.setQueryData<AiChatSession>(
        AiMessageKeys.session(aiChatSession.id as string | null),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...(old.messages || []),
              {
                order: (old.messages?.length || 0) + 1,
                role: "assistant",
                responseId: stream.responseId,
                content: contentFunctionCall,
                createdAt: stream.createdAt,
              },
            ],
          };
        }
      );
    } else if (content.$type === "functionResult") {
      const contentFunctionResult =
        content as AiChatContentFunctionResultStream;
      queryClient.setQueryData<AiChatSession>(
        AiMessageKeys.session(aiChatSession.id as string | null),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...(old.messages || []),
              {
                order: (old.messages?.length || 0) + 1,
                role: "assistant",
                responseId: stream.responseId,
                content: contentFunctionResult,
                createdAt: stream.createdAt,
              },
            ],
          };
        }
      );
    }
  });
}
