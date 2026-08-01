export const queryKeys = {
    conversations: {
        all: ["conversations"] as const,
        detail: (id: number) => ["conversation", id] as const,
    },
    messages: {
        byConversation: (conversationId: number) => ["messages", conversationId] as const,
    },
};