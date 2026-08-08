import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createUIMessageStreamResponse, createIdGenerator, streamText, toUIMessageStream, type UIMessage } from "ai";
import { getConversation } from "@/features/conversation/actions/conversation-action";
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { getMessageId } from "@/features/messages/actions/message-action";

export async function POST(request: Request) {

    try {
        await auth.protect();

        const { message, conversationId }: { message: UIMessage, conversationId: number } = await request.json();

        if (!conversationId || !message) {
            return new Response("Missing conversationId or messages", { status: 400 });
        }

        const conversation = await getConversation(conversationId);
        const previousMessages = await loadChatMessages(conversation.id);

        const alreadysaved = previousMessages.some(m => m.id.toString() === message.id.toString());
        
        const messages = alreadysaved ? previousMessages : [...previousMessages, message];

        if (!alreadysaved) {
            const next_message_id = await getMessageId();
            message.id = next_message_id.toString();
            await saveChatMessages(conversationId, [message]);
        }

        const next_message_id = await getMessageId();
        
        const result = streamText({
            model: getChatModel(conversation.model),
            system: conversation.systemPrompt ?? "You are a helpful assistant.",
            messages: await convertToModelMessages(messages),
        });

        result.consumeStream();
        return createUIMessageStreamResponse({
            stream:toUIMessageStream({
               stream:result.stream,
               originalMessages:messages,
               generateMessageId: () => next_message_id.toString(),
               onEnd:async({messages:finalMessages})=>{
                try {
                    await saveChatMessages(conversation.id , finalMessages , {updateTitle:false})
                } catch (error) {
                    console.error(error);
                }
               }
            })
        })

    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 400 });
        }
        return new Response("Internal server error", { status: 500 });
    }

}