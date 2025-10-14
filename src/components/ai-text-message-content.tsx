import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/shadcn-io/ai/reasoning";
import {
  extractThinkContentTrimmed,
  removeThinkBlock,
} from "@/lib/think-parser";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { cn } from "@/lib/utils";
import type { AiChatContentText } from "@/types/ai-chat-content";

export function AiTextMessageContent({
  content,
  className,
}: {
  content: AiChatContentText;
  className?: string;
}) {
  const think = extractThinkContentTrimmed(content.text);
  const answear = removeThinkBlock(content.text);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden text-foreground text-sm p-0",
        "group-[.is-user]:text-primary-foreground",
        "group-[.is-assistant]:text-foreground",
        className
      )}
    >
      {think && (
        <Reasoning
          className="w-full"
          defaultOpen={think != null && answear === null}
          isStreaming={think != null && answear === null}
        >
          <ReasoningTrigger />
          <ReasoningContent>{think}</ReasoningContent>
        </Reasoning>
      )}
      {answear && <Response>{answear}</Response>}
    </div>
  );
}
