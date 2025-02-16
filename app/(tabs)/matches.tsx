import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/auth";
import MatchCard from "@/components/MatchCard";

type Match = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
};

export default function MatchesScreen() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          user:profiles!matches_matched_user_id_fkey (
            id,
            name,
            avatar_url
          ),
          last_message:messages (
            content,
            created_at
          )
        `)
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall">No matches yet</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Keep exploring to find your match!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            id={item.id}
            name={item.user.name}
            photoUrl={item.user.avatar_url}
            lastMessage={item.last_message?.content}
            lastActive={
              item.last_message?.created_at
                ? new Date(item.last_message.created_at).toLocaleDateString()
                : undefined
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  list: {
    paddingVertical: 8,
  },
}); 