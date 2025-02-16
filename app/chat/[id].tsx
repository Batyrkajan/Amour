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

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  ai_generated: boolean;
};

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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: session?.user.id,
        content: newMessage,
        ai_generated: false,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const context = "Dating app conversation"; // TODO: Add more context
      const messageHistory = messages
        .slice(-5)
        .map(m => `${m.sender_id === session?.user.id ? "You" : "Match"}: ${m.content}`);

      const newSuggestions = await getMessageSuggestions(context, messageHistory);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
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
          />
        )}
        contentContainerStyle={styles.messageList}
        onLayout={() => flatListRef.current?.scrollToEnd()}
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
          onChangeText={setNewMessage}
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
  );
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