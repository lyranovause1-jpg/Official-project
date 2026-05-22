import OpenAI from "openai";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

export const AI_READY = !!(baseURL && apiKey);

export const openai = AI_READY
  ? new OpenAI({ apiKey: apiKey!, baseURL: baseURL! })
  : (new Proxy({} as OpenAI, {
      get() {
        throw new Error(
          "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY are not set. " +
          "The AI is running in brain-only mode — LLM calls are not available yet."
        );
      },
    }) as OpenAI);
