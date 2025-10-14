export interface AiChatContentStream {
  $type: "text" | "functionCall" | "functionResult";
}

export interface AiChatContentTextStream extends AiChatContentStream {
  $type: "text";
  text: string;
}

export interface AiChatContentFunctionCallStream extends AiChatContentStream {
  $type: "functionCall";
  callId: string;
  name: string;
  arguments: any;
}

export interface AiChatContentFunctionResultStream extends AiChatContentStream {
  $type: "functionResult";
  callId: string;
  result: any;
}
