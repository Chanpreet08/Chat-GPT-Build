/** Client-safe tool display metadata (no Node / Tavily imports). */
export const TOOL_LABELS: Record<string, string> = {
  webSearch: "Searching the web",
  webExtract: "Reading page content",
};

export function getToolLabel(name: string) {
  return TOOL_LABELS[name] ?? `Using ${name}`;
}
