import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth";
import type { MessageStatus } from "@/types/chat";
import { useInView } from "react-native-intersection-observer";

type ChatMessageProps = {
  content: string;
  senderId: string;
  timestamp: string;
  isAI?: boolean;
  status?: MessageStatus;
  onVisible?: () => void;
};

const STATUS_ICONS = {
  sending: "clock-outline",
  sent: "check",
  delivered: "check-all",
  read: "check-all",
  error: "alert-circle",
};

const STATUS_COLORS = {
  sending: "#999",
  sent: "#999",
  delivered: "#999",
  read: "#34C759",
  error: "#FF3B30",
};

export function ChatMessage({
  content,
  senderId,
  timestamp,
  isAI,
  status,
  onVisible,
}: ChatMessageProps) {
  const { session } = useAuth();
  const isCurrentUser = senderId === session?.user.id;
  const { ref, inView } = useInView({
    threshold: 0.5,
  });
  const visibilityReported = useRef(false);

  useEffect(() => {
    if (inView && !visibilityReported.current && onVisible) {
      onVisible();
      visibilityReported.current = true;
    }
  }, [inView, onVisible]);

  return (
    <View ref={ref}>
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
        <View style={styles.footer}>
          <Text variant="labelSmall" style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isCurrentUser && status && (
            <MaterialCommunityIcons
              name={STATUS_ICONS[status]}
              size={14}
              color={STATUS_COLORS[status]}
              style={styles.statusIcon}
            />
          )}
        </View>
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statusIcon: {
    marginLeft: 4,
  },
});
