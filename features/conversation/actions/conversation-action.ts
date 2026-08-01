"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

export type ConversationListItem = {
    id: number;
    title: string;
    model: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
}


export async function listConversations() {
    const user = await requireUser();

    const conversations = await prisma.conversation.findMany({
        where: {
            userId: user.id, isArchived: false,
        },
        orderBy: [
            {
                isPinned: 'desc',
            },
            {
                lastMessageAt: 'desc',
            },
        ],
        select: {
            id: true,
            title: true,
            model: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
        },
    });
    
    return conversations;
}

export async function createConversation(title: string = 'New Conversation') {
    const user = await requireUser();

    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            model: 'gpt-4o',
            title: title || 'New Conversation',
            systemPrompt: 'You are a helpful assistant.',
            isPinned: false,
            isArchived: false,
        },
    });

    return conversation;
}


export async function updateConversation(id: number, data: { title?: string, isPinned?: boolean, isArchived?: boolean }) {
    const user = await requireUser();

    try {
        const conversation = await prisma.conversation.update({
            where: { id: id, userId: user.id },
            data: {
                title: (data.title !== undefined ? { set: data.title.trim()  || "New Conversation"} : {}),
                isPinned: (data.isPinned !== undefined ? { set: data.isPinned } : {}),
                isArchived: (data.isArchived !== undefined ? { set: data.isArchived } : {}),
            },
        });
        revalidatePath('/');
        revalidatePath(`/conversation/${id}`);
        return conversation;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Conversation not found');
        }
        throw error;
    }
}

export async function deleteConversation(id: number) {
    const user = await requireUser();

    try {
        await prisma.conversation.delete({
            where: {
                id: id,
                userId: user.id,
            },
        });
        revalidatePath('/');
        return { id: id, success: true };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Conversation not found');
        }
        throw error;
    }
}