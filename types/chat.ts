export type ProfileContext = {
  name: string;
  age: number;
  bio: string;
  interests?: string[];
  matchName: string;
  matchAge: number;
  matchBio: string;
  matchInterests?: string[];
  conversationStage: "initial" | "getting_to_know" | "planning_date";
};

export type MessageContext = {
  profile: ProfileContext;
  messageCount: number;
  lastMessageTimestamp?: string;
  hasSharedContacts: boolean;
};

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";

export type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  ai_generated: boolean;
  status?: MessageStatus;
};
