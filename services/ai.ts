import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
const BASE_URL = process.env.EXPO_PUBLIC_DEEPSEEK_BASE_URL;

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

export async function getMessageSuggestions(
  context: string,
  messageHistory: string[]
): Promise<string[]> {
  try {
    const response = await client.post("/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an AI wingman helping users have better conversations on a dating app. Provide 3 short, engaging message suggestions that are natural and show genuine interest. Keep suggestions under 100 characters each.",
        },
        {
          role: "user",
          content: `Context: ${context}\n\nMessage History: ${messageHistory.join(
            "\n"
          )}\n\nProvide 3 message suggestions:`,
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

    return suggestions;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return [];
  }
}
