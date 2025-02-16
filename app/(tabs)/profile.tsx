import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import { router } from "expo-router";
import { supabase } from "@/config/supabase";

export default function ProfileScreen() {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Your Profile
      </Text>

      {/* TODO: Display profile information */}

      <Button mode="outlined" onPress={handleSignOut} style={styles.signOutButton}>
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  signOutButton: {
    marginTop: "auto",
  },
}); 