"use client";

import {
  getToolName,
  isTextUIPart,
  isToolUIPart,
  type ChatStatus,
  type UIMessage,
} from "ai";
import {
  CheckIcon,
  SearchIcon,
  GlobeIcon,
  WrenchIcon,
  RefreshCwIcon,
} from "lucide-react";
import { getToolLabel } from "@/features/ai/utils/tool-labels";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { Button } from "@/components/ui/button";

/** Extracts plain text from a `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

function getToolIcon(name: string) {
  if (name === "webSearch") return SearchIcon;
  if (name === "webExtract") return GlobeIcon;
  return WrenchIcon;
}

function ToolCallStatus({
  name,
  state,
  query,
  errorText,
}: {
  name: string;
  state: string;
  query?: string;
  errorText?: string;
}) {
  const Icon = getToolIcon(name);
  const isDone = state === "output-available";
  const isError = state === "output-error" || state === "output-denied";
  const isRunning = !isDone && !isError;

  return (
    <div
      className={
        isError
          ? "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
          : "flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
      }
    >
      {isRunning ? (
        <Loader size={14} className="mt-0.5 shrink-0" />
      ) : isDone ? (
        <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Icon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
      )}
      <div className="min-w-0">
        <p className={isError ? "font-medium text-destructive" : "font-medium text-foreground/80"}>
          {isRunning
            ? `${getToolLabel(name)}…`
            : isDone
              ? `${getToolLabel(name)} — done`
              : `${getToolLabel(name)} — failed`}
        </p>
        {query ? (
          <p className="truncate text-xs text-muted-foreground">{query}</p>
        ) : null}
        {isError && errorText ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-xs text-destructive/90">
            {errorText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  error?: Error;
  onRetry?: () => void;
};

/**
 * Renders the conversation message list with markdown responses,
 * in-progress tool calls, and a loading indicator.
 */
export function ChatMessages({
  messages,
  status,
  error,
  onRetry,
}: ChatMessagesProps) {
  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const lastAssistantText =
    lastMessage?.role === "assistant" ? getMessageText(lastMessage) : "";
  const lastHasToolParts =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((part) => isToolUIPart(part));
  const failedToolErrors =
    lastMessage?.role === "assistant"
      ? lastMessage.parts
          .filter(isToolUIPart)
          .filter(
            (part) =>
              part.state === "output-error" || part.state === "output-denied"
          )
          .map((part) =>
            "errorText" in part && part.errorText
              ? part.errorText
              : `${getToolLabel(getToolName(part))} failed`
          )
      : [];
  const hasFailedTool = failedToolErrors.length > 0;
  const errorMessage =
    error?.message ||
    failedToolErrors[0] ||
    "Something went wrong generating a response.";

  // Generic loader only when we have no assistant content and no tool UI yet.
  const showTrailingLoader =
    isBusy &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" &&
        lastAssistantText.length === 0 &&
        !lastHasToolParts));

  const showRetry =
    !isBusy &&
    Boolean(onRetry) &&
    (status === "error" || hasFailedTool);

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => {
          const text = getMessageText(message);
          const toolParts = message.parts.filter(isToolUIPart);
          const isStreamingEmptyAssistant =
            message.role === "assistant" &&
            message.id === lastMessage?.id &&
            text.length === 0 &&
            toolParts.length === 0 &&
            isBusy;

          if (isStreamingEmptyAssistant) {
            return null;
          }

          return (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <div className="flex flex-col gap-2">
                  {toolParts.map((part) => {
                    const name = getToolName(part);
                    const input = part.input as
                      | { query?: string; urls?: string[] }
                      | undefined;
                    const query =
                      input?.query ??
                      (input?.urls?.length
                        ? input.urls.join(", ")
                        : undefined);

                    return (
                      <ToolCallStatus
                        key={part.toolCallId}
                        name={name}
                        state={part.state}
                        query={query}
                        errorText={
                          "errorText" in part ? part.errorText : undefined
                        }
                      />
                    );
                  })}

                  {text.length > 0 ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : null}
                </div>
              </MessageContent>
            </Message>
          );
        })}

        {showTrailingLoader ? (
          <Message from="assistant">
            <MessageContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader />
                <span className="text-sm">Thinking…</span>
              </div>
            </MessageContent>
          </Message>
        ) : null}

        {showRetry ? (
          <Message from="assistant">
            <MessageContent>
              <div className="flex flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Response failed
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm text-destructive/90">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                >
                  <RefreshCwIcon data-icon="inline-start" />
                  Retry
                </Button>
              </div>
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
    </Conversation>
  );
}
