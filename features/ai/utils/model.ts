import { openai, OpenAIProvider } from '@ai-sdk/openai';
import { createGoogleGenerativeAI, GoogleProvider } from '@ai-sdk/google';


export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "gemini-3.5-flash";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_PROVIDERS: Record<string, GoogleProvider | OpenAIProvider> = {
    GOOGLE: google,
    OPENAI: openai,
}

export function getChatModel(model: string) {
    let modelToUse = DEFAULT_MODEL;
    const modelProvider = process.env.MODEL_PROVIDER?.toUpperCase() || "GOOGLE";

    const provider = MODEL_PROVIDERS[modelProvider];
    if (model) {
        modelToUse = model;
    }
    return provider(modelToUse);
}