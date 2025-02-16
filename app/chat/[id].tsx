import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { TextInput, IconButton, Button } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { ChatMessage } from "@/components/ChatMessage";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/auth";
import { getMessageSuggestions } from "@/services/ai";
import type { MessageContext, ProfileContext } from "@/types/chat";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AIError } from "@/services/ai";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { TypingIndicator } from "@/components/TypingIndicator";
import type { Message, MessageStatus } from "@/types/chat";

export default function ChatScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [conversationContext, setConversationContext] = useState<MessageContext>({
    profile: {
      name: "Loading...",
      age: 0,
      bio: "",
      matchName: "",
      matchAge: 0,
      matchBio: "",
      conversationStage: "initial",
    },
    messageCount: 0,
    hasSharedContacts: false,
  });
  const [error, setError] = useState<AIError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          flatListRef.current?.scrollToEnd();
        }
      )
      .subscribe();

    // Subscribe to message status changes
    const statusChannel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusChannel);
    };
  }, [matchId]);

  useEffect(() => {
    fetchProfiles();
  }, [matchId]);

  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "presence",
        { event: "sync" },
        () => {
          const state = channel.presenceState<{ isTyping: boolean }>();
          const matchTyping = Object.values(state)
            .flat()
            .some(
              presence => presence.user_id !== session?.user.id && presence.isTyping
            );
          setIsTyping(matchTyping);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      // Fetch both profiles in parallel
      const [userProfile, matchProfile] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session?.user.id)
          .single(),
        supabase
          .from("profiles")
          .select("*")
          .eq("id", matchId)
          .single(),
      ]);

      if (userProfile.error || matchProfile.error) throw userProfile.error || matchProfile.error;

      setConversationContext(prev => ({
        ...prev,
        profile: {
          name: userProfile.data.name,
          age: userProfile.data.age,
          bio: userProfile.data.bio,
          interests: userProfile.data.interests,
          matchName: matchProfile.data.name,
          matchAge: matchProfile.data.age,
          matchBio: matchProfile.data.bio,
          matchInterests: matchProfile.data.interests,
          conversationStage: determineConversationStage(messages.length),
        },
        messageCount: messages.length,
        lastMessageTimestamp: messages[messages.length - 1]?.created_at,
        hasSharedContacts: messages.some(m => 
          m.content.includes("phone") || m.content.includes("@")
        ),
      }));
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setError(
        new AIError(
          "Failed to load profile information. Please try again.",
          "PROFILE_LOAD_ERROR",
          true
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageVisible = async (messageId: string, senderId: string) => {
    if (senderId === session?.user.id) return; // Don't mark own messages

    try {
      const { error } = await supabase
        .from("messages")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .eq("sender_id", senderId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      match_id: matchId,
      sender_id: session?.user.id!,
      content: newMessage,
      created_at: new Date().toISOString(),
      ai_generated: false,
      status: "sending",
    };

    try {
      setSending(true);
      // Optimistically add message
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          match_id: matchId,
          sender_id: session?.user.id,
          content: newMessage,
          ai_generated: false,
          status: "sent",
        })
        .select()
        .single();

      if (error) throw error;

      // Update with real message data
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? data : msg))
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Update temp message to show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "error" } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setError(null);
      const messageHistory = messages
        .slice(-5)
        .map(m => `${m.sender_id === session?.user.id ? "You" : "Match"}: ${m.content}`);

      const newSuggestions = await getMessageSuggestions(
        conversationContext,
        messageHistory
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      if (error instanceof AIError) {
        setError(error);
      } else {
        setError(
          new AIError(
            "An unexpected error occurred while getting suggestions.",
            "UNKNOWN",
            false
          )
        );
      }
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const channel = supabase
      .channel(`match:${matchId}`)
      .track({ isTyping: true });
    typingTimeoutRef.current = setTimeout(() => {
      channel.track({ isTyping: false });
    }, 1000);
  };

  return (
    <>
      <ErrorAlert
        error={error}
        onDismiss={() => setError(null)}
        onRetry={fetchSuggestions}
      />
      {isLoading && <LoadingOverlay message="Loading profiles..." />}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage
              content={item.content}
              senderId={item.sender_id}
              timestamp={item.created_at}
              isAI={item.ai_generated}
              status={item.status}
              onVisible={() => handleMessageVisible(item.id, item.sender_id)}
            />
          )}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        <View style={styles.inputContainer}>
          <IconButton
            icon="lightbulb"
            mode="contained"
            onPress={() => {
              setShowSuggestions(prev => !prev);
              if (!suggestions.length) {
                fetchSuggestions();
              }
            }}
            style={styles.suggestionButton}
          />
          <TextInput
            mode="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              handleTyping();
            }}
            style={styles.input}
            multiline
            maxLength={500}
            disabled={sending}
          />
          <IconButton
            icon="send"
            mode="contained"
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={styles.sendButton}
          />
        </View>

        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            {loadingSuggestions ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  mode="outlined"
                  onPress={() => {
                    setNewMessage(suggestion);
                    setShowSuggestions(false);
                  }}
                  style={styles.suggestionButton}
                >
                  {suggestion}
                </Button>
              ))
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

function determineConversationStage(messageCount: number): ProfileContext["conversationStage"] {
  if (messageCount < 5) return "initial";
  if (messageCount < 20) return "getting_to_know";
  return "planning_date";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  sendButton: {
    margin: 0,
  },
  suggestionButton: {
    margin: 0,
  },
  suggestionsContainer: {
    padding: 16,
  },
  loader: {
    margin: 16,
  },
}); 