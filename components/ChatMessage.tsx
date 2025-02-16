import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useAuth } from "@/contexts/auth";

type ChatMessageProps = {
  content: string;
  senderId: string;
  timestamp: string;
  isAI?: boolean;
};

export function ChatMessage({ content, senderId, timestamp, isAI }: ChatMessageProps) {
  const { session } = useAuth();
  const isCurrentUser = senderId === session?.user.id;

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUser : styles.otherUser,
      ]}
    >
      {isAI && (
        <Text variant="labelSmall" style={styles.aiLabel}>
          AI Wingman
        </Text>
      )}
      <Surface
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          isAI && styles.aiBubble,
        ]}
      >
        <Text style={styles.message}>{content}</Text>
        <Text variant="labelSmall" style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  currentUser: {
    alignSelf: "flex-end",
  },
  otherUser: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: "#007AFF",
  },
  otherUserBubble: {
    backgroundColor: "#E9E9EB",
  },
  aiBubble: {
    backgroundColor: "#FF4B4B",
  },
  message: {
    color: "#fff",
    marginBottom: 4,
  },
  timestamp: {
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
  },
  aiLabel: {
    color: "#FF4B4B",
    marginBottom: 4,
  },
}); 