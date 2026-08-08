import { openai } from '@ai-sdk/openai';


export const DEFAULT_MODEL = "gpt-4o-mini";


export function getChatModel(model: string = DEFAULT_MODEL) {
    return openai(model);
}