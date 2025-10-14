export interface AiChatContent {
  $type: "text" | "functionCall" | "functionResult";
}

export interface AiChatContentText extends AiChatContent {
  $type: "text";
  text: string;
}

export interface AiChatFunctionCallContent extends AiChatContent {
  $type: "functionCall";
  callId: string;
  name: string;
  arguments: any;
}

export interface AiChatFunctionResultContent extends AiChatContent {
  $type: "functionResult";
  callId: string;
  result: any;
}
