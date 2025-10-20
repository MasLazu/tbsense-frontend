import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/shadcn-io/ai/tool";
import type {
  AiChatFunctionCallContent,
  AiChatFunctionResultContent,
} from "@/types/ai-chat-content";

export function AiFunctionMessageContent({
  functionCall,
  functionResult,
}: {
  functionCall: AiChatFunctionCallContent;
  functionResult: AiChatFunctionResultContent | null;
}) {
  console.log("Rendering AiFunctionMessageContent", {
    functionCall,
    functionResult,
  });
  return (
    <Tool key={functionCall.callId} defaultOpen={false} className="w-full">
      <ToolHeader
        type={`${functionCall.name}` as any}
        state={
          !functionResult
            ? "input-available"
            : functionResult.result?.success
            ? "output-available"
            : "output-error"
        }
      />
      <ToolContent>
        <ToolInput input={functionCall.arguments} />
        {functionResult && (
          <ToolOutput
            output={
              <pre className="text-xs">
                {JSON.stringify(functionResult.result, null, 2)}
              </pre>
            }
            errorText={
              functionResult.result?.success === false
                ? functionResult.result?.message
                : undefined
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
}
