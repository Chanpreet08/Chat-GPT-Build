"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/features/conversation/libs/query-keys";
import { listConversations, createConversation, deleteConversation, updateConversation } from "@/features/conversation/actions/conversation-action";

export function useConversations() {
    return useQuery({
        queryKey: queryKeys.conversations.all,
        queryFn: listConversations,
    });
}

export function useCreateConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (title: string) => createConversation(title),
        onSuccess: (conversation) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            router.push(`/conversation/${conversation.id}`);
            toast.success("Conversation created successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create conversation");
        },
    });
}

export function useUpdateConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ id, title, isPinned, isArchived }: { id: number, title?: string, isPinned?: boolean, isArchived?: boolean }) => updateConversation(id, { title, isPinned, isArchived }),
        onSuccess: (conversation) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(conversation.id) });
            toast.success("Conversation updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update conversation");
        },
    });
}

export function useDeleteConversation(activeId?: number) {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (id: number) => deleteConversation(id),
        onSuccess: ( { id } ) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.messages.byConversation(id) });

            if (activeId === id) {
                router.push("/");
            }
            toast.success("Conversation deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete conversation");
        },
    });
}