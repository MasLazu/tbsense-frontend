import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/ai-assistant/")({
  component: RouteComponent,
});

function RouteComponent() {
  // return (
  // <div className="grid place-content-center p-4 overflow-h-auto h-screen">
  // <AiChatSession
  //   className="flex flex-col h-screen max-w-2xl"
  //   user={{
  //     name: "User",
  //     avatarUrl:
  //       "https://gravatar.com/avatar/4c8e7a1dbe3f19767ad1ddd0fdab02c223910fb442861249454bffd743e9272c?v=1758093380000&size=256&d=initials",
  //   }}
  // />
  // </div>
  // );
}
