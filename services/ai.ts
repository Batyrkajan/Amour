import axios, { AxiosError } from "axios";
import { sleep } from "@/utils/sleep";
import { Cache } from "@/utils/cache";
import type { MessageContext } from "@/types/chat";

const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
const BASE_URL = process.env.EXPO_PUBLIC_DEEPSEEK_BASE_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache suggestions for 5 minutes
const suggestionCache = new Cache<string[]>(5);

if (!API_KEY || !BASE_URL) {
  throw new Error("Missing Deepseek configuration. Check your .env file.");
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

type DeepseekError = {
  error: {
    message: string;
    type: string;
    code: string;
  };
};

export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public shouldRetry: boolean = false
  ) {
    super(message);
    this.name = "AIError";
  }
}

function getContextPrompt(context: MessageContext): string {
  const { profile, messageCount, lastMessageTimestamp, hasSharedContacts } =
    context;

  return `
User Profile:
- Name: ${profile.name} (${profile.age})
- Bio: ${profile.bio}
${profile.interests ? `- Interests: ${profile.interests.join(", ")}` : ""}

Match Profile:
- Name: ${profile.matchName} (${profile.matchAge})
- Bio: ${profile.matchBio}
${
  profile.matchInterests
    ? `- Interests: ${profile.matchInterests.join(", ")}`
    : ""
}

Conversation Context:
- Messages exchanged: ${messageCount}
${lastMessageTimestamp ? `- Last message: ${lastMessageTimestamp}` : ""}
- Stage: ${profile.conversationStage}
- Contact info ${hasSharedContacts ? "has" : "has not"} been shared

Provide suggestions that:
1. Match the conversation stage
2. Reference shared interests when possible
3. Are natural and engaging
4. Lead towards meeting in person if appropriate
`.trim();
}

function generateCacheKey(
  context: MessageContext,
  messageHistory: string[]
): string {
  const { profile } = context;
  const recentMessages = messageHistory.slice(-3);
  return `${profile.name}:${profile.matchName}:${context.messageCount}:${
    profile.conversationStage
  }:${recentMessages.join("|")}`;
}

export async function getMessageSuggestions(
  context: MessageContext,
  messageHistory: string[],
  retryCount = 0,
  useCache = true
): Promise<string[]> {
  const cacheKey = generateCacheKey(context, messageHistory);

  if (useCache) {
    const cachedSuggestions = suggestionCache.get(cacheKey);
    if (cachedSuggestions) {
      return cachedSuggestions;
    }
  }

  try {
    const response = await client.post("/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
You are an AI wingman helping users have better conversations on a dating app.
Your goal is to help the user build genuine connections while moving the conversation forward naturally.
Provide 3 short, engaging message suggestions that show genuine interest and match the conversation context.
Keep suggestions under 100 characters each and avoid being too forward or inappropriate.
`.trim(),
        },
        {
          role: "user",
          content: `
${getContextPrompt(context)}

Recent messages:
${messageHistory.join("\n")}

Provide 3 message suggestions:`.trim(),
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const suggestions =
      response.data.choices[0].message.content
        ?.split("\n")
        .filter(Boolean)
        .map((suggestion: string) => suggestion.replace(/^\d+\.\s*/, ""))
        .slice(0, 3) || [];

    // Cache successful responses
    if (suggestions.length > 0) {
      suggestionCache.set(cacheKey, suggestions);
    }

    return suggestions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<DeepseekError>;
      const errorData = axiosError.response?.data;

      // Handle rate limiting
      if (axiosError.response?.status === 429) {
        if (retryCount < MAX_RETRIES) {
          await sleep(RETRY_DELAY * (retryCount + 1));
          return getMessageSuggestions(context, messageHistory, retryCount + 1);
        }
        throw new AIError(
          "Too many requests. Please try again later.",
          "RATE_LIMIT",
          false
        );
      }

      // Handle other API errors
      if (errorData?.error) {
        throw new AIError(
          errorData.error.message,
          errorData.error.code,
          errorData.error.type === "temporary_error"
        );
      }
    }

    // Handle unexpected errors
    throw new AIError(
      "An unexpected error occurred while getting suggestions.",
      "UNKNOWN",
      false
    );
  }
}
