import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAiSessionsPaginated } from "../hooks/use-ai-session";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { AiChatSession } from "@/types/ai-chat-session";

interface AiChatSessionSelectorProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  currentSessionTitle?: string;
  className?: string;
}

export function AIChatSessionSelector({
  currentSessionId,
  onSessionSelect,
  currentSessionTitle,
  className,
}: AiChatSessionSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, 300);

  React.useEffect(() => {
    debouncedSetSearch(search);
  }, [search, debouncedSetSearch]);

  const { data: sessionsData, isLoading } = useAiSessionsPaginated({
    page: 1,
    pageSize: 5,
    orderBy: [{ field: "lastActivityAt", desc: true }],
    filters: [{ field: "title", operator: "contains", value: debouncedSearch }],
  });

  const sessions: AiChatSession[] = sessionsData?.items || [];

  console.log("Sessions data:", sessionsData);
  console.log("Extracted sessions:", sessions);

  const chatOptions = [
    {
      id: null,
      title: "New Session",
      isNewChat: true,
    },
    ...sessions.map((session) => ({
      id: session.id,
      title: session.title || "Untitled Session",
      isNewChat: false,
    })),
  ];

  const getCurrentLabel = () => {
    if (!currentSessionId) return "New Session";
    if (currentSessionTitle) return currentSessionTitle;
    const session = sessions.find((s) => s.id === currentSessionId);
    return session?.title || "Untitled Session";
  };

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between font-medium hover:bg-transparent",
            className
          )}
        >
          <span className="truncate">{getCurrentLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 min-w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search chats..."
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No chats found."}
            </CommandEmpty>
            <CommandGroup>
              {chatOptions.map((option) => (
                <CommandItem
                  key={option.id || "new-chat"}
                  value={option.id ? option.id! : undefined}
                  onSelect={() => {
                    onSessionSelect(option.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  {option.isNewChat ? (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className="flex-1 truncate">{option.title}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentSessionId === option.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
