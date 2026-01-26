import OpenAI from "openai";

/**
 * OpenAI Client Configuration
 * 
 * Story 4.2: AC2 - LLM API call (OpenAI GPT-4o-mini primary)
 * 
 * Environment variable required:
 * - OPENAI_API_KEY: From OpenAI platform
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
