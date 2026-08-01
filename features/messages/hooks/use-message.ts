"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/features/conversation/libs/query-keys";
import { createMessage, updateMessage, deleteMessage } from "@/features/messages/actions/message-action";
import { listMessages } from "@/features/messages/actions/message-action";

export function useMessage(conversationId: number) {
    return useQuery({
        queryKey: queryKeys.messages.byConversation(conversationId),
        queryFn: () => listMessages(conversationId!),
        enabled: Boolean(conversationId),
    });
}

export function useCreateMessage(conversationId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => createMessage(conversationId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.messages.byConversation(conversationId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            toast.success("Message created successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create message");
        },
    });
}

export function useUpdateMessage(messageId: number, conversationId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => updateMessage(messageId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.messages.byConversation(conversationId) });
            toast.success("Message updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update message");
        },
    });
}

export function useDeleteMessage(messageId: number, conversationId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => deleteMessage(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.messages.byConversation(conversationId) });
            toast.success("Message deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete message");
        },
    });
}