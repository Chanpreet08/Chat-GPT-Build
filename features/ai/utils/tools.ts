import { tavilySearch, tavilyExtract } from "@tavily/ai-sdk";
import { TOOL_LABELS } from "@/features/ai/utils/tool-labels";

const TOOLS = {
  webSearch: {
    name: "webSearch",
    label: TOOL_LABELS.webSearch,
    function: tavilySearch(),
  },
  webExtract: {
    name: "webExtract",
    label: TOOL_LABELS.webExtract,
    function: tavilyExtract(),
  },
};

/** Server-only: AI SDK tool map for streamText. */
export function getTools() {
  return Object.fromEntries(
    Object.values(TOOLS).map((t) => [t.name, t.function])
  );
}
