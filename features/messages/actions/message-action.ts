"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { MessageRole, MessageStatus } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";


export type MessageListItem = {
    id: number;
    conversationId: number;
    role: MessageRole;
    status: MessageStatus;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
}

export async function listMessages(conversationId: number) {
    const user = await requireUser();

    const messages = await prisma.message.findMany({
        where: { conversationId: conversationId, userId: user.id },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            conversationId: true,
            role: true,
            status: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
        },
    });

    return messages;
}


export async function createMessage(conversationId: number, content: string) {
    const user = await requireUser();

    const trimmedMessage = content.trim();
    if (trimmedMessage.length === 0) {
        throw new Error("Message cannot be empty");
    }

    const message = await prisma.message.create({
        data: { 
            conversationId: conversationId,
            role: MessageRole.USER,
            content: trimmedMessage,
            status: MessageStatus.COMPLETED,
            userId: user.id,
        },
    });

    revalidatePath(`/conversation/${conversationId}`);

    return message;
}

export async function updateMessage(messageId: number, content: string) {
    const user = await requireUser();

    const trimmedMessage = content.trim();
    if (trimmedMessage.length === 0) {
        throw new Error("Message cannot be empty");
    }

    try {
        const message = await prisma.message.update({
        where: { id: messageId, userId: user.id },
            data: { content: trimmedMessage},
        });

        revalidatePath(`/conversation/${message.conversationId}`);
        return message;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Message not found');
        }
        throw error;
    }
}

export async function deleteMessage(messageId: number) {
    const user = await requireUser();

    try {
        const message = await prisma.message.delete({ where: { id: messageId, userId: user.id } });
        revalidatePath(`/conversation/${message.conversationId}`);
        return message;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Message could not be deleted');
        }
        throw error;
    }}