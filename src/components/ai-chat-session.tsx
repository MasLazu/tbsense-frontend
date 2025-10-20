import { useState } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/shadcn-io/ai/message";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import { useAiMessage } from "../hooks/use-ai-message";
import { AIChatSessionSelector } from "./ai-chat-session-selector";
import { useOpenedAiSession } from "../hooks/use-opened-ai-session";
import { AiTextMessageContent } from "./ai-text-message-content";
import { AiFunctionMessageContent } from "./ai-function-message-content";
import type { AiChatMessage } from "@/types/ai-chat-message";
import type {
  AiChatContentText,
  AiChatFunctionCallContent,
  AiChatFunctionResultContent,
} from "@/types/ai-chat-content";

const models = [{ id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air" }];

interface AiChatSessionProps {
  user?: {
    name?: string;
    avatarUrl?: string;
  };
  className?: string;
}

export function AiChatSession({ user, className }: AiChatSessionProps) {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);

  const { sessionId, setSession } = useOpenedAiSession();
  const {
    historyMessages,
    sendMessageMutate,
    sendFirstMessageMutate,
    isStreaming,
  } = useAiMessage();

  const chatBubbles: { role: string; messages: AiChatMessage[] }[] = [];
  console.log("History Messages:", historyMessages);
  console.log("Chat Bubbles:", chatBubbles);

  historyMessages?.messages?.forEach((msg) => {
    const lastChatBubble = chatBubbles.at(-1);
    if (
      (lastChatBubble && lastChatBubble.role === msg.role) ||
      (lastChatBubble &&
        lastChatBubble.role === "assistant" &&
        msg.role === "tool")
    ) {
      lastChatBubble.messages.push(msg);
    } else {
      chatBubbles.push({ role: msg.role, messages: [msg] });
    }
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3.5 flex items-center justify-center">
        <AIChatSessionSelector
          className="w-full"
          currentSessionId={sessionId}
          onSessionSelect={setSession}
          currentSessionTitle={historyMessages?.title ?? "New Session"}
        />
      </div>

      <Conversation className="flex-grow text-sm">
        <ConversationContent>
          {chatBubbles.map((chat) => (
            <Message
              from={chat.role as "assistant" | "user"}
              key={chat.messages[0].order}
            >
              <MessageContent>
                {chat.messages.map((msg) =>
                  msg.content.$type === "text" ? (
                    <AiTextMessageContent
                      key={msg.order}
                      content={msg.content as AiChatContentText}
                    />
                  ) : msg.content.$type === "functionCall" ? (
                    <AiFunctionMessageContent
                      key={msg.order}
                      functionCall={msg.content as AiChatFunctionCallContent}
                      functionResult={
                        (chat.messages.find(
                          (result) =>
                            result.content.$type === "functionResult" &&
                            (result.content as AiChatFunctionResultContent)
                              .callId ===
                              (msg.content as AiChatFunctionCallContent).callId
                        )?.content as AiChatFunctionResultContent) ?? null
                      }
                    />
                  ) : null
                )}
              </MessageContent>
              <MessageAvatar
                name={chat.role === "user" ? user?.name : "AI"}
                src={chat.role === "user" ? "" : ""}
              />
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-3 w-full">
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault();
            setText("");
            sessionId
              ? sendMessageMutate({ sessionId, message: text })
              : sendFirstMessageMutate({ chatMessage: text });
          }}
        >
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder="Type your message..."
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect onValueChange={setModel} value={model}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!text || isStreaming}
              status={isStreaming ? "streaming" : "ready"}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
