import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Text, Surface } from "react-native-paper";
import { router } from "expo-router";

type MatchCardProps = {
  id: string;
  name: string;
  photoUrl: string;
  lastMessage?: string;
  lastActive?: string;
};

export default function MatchCard({ id, name, photoUrl, lastMessage, lastActive }: MatchCardProps) {
  return (
    <Pressable onPress={() => router.push(`/chat/${id}`)}>
      <Surface style={styles.container} elevation={1}>
        <Image source={{ uri: photoUrl }} style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="titleMedium">{name}</Text>
            {lastActive && (
              <Text variant="bodySmall" style={styles.timestamp}>
                {lastActive}
              </Text>
            )}
          </View>
          {lastMessage && (
            <Text variant="bodyMedium" numberOfLines={1} style={styles.message}>
              {lastMessage}
            </Text>
          )}
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  message: {
    opacity: 0.7,
  },
  timestamp: {
    opacity: 0.5,
  },
}); 