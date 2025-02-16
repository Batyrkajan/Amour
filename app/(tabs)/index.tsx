import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import SwipeableCard from "@/components/SwipeableCard";

// Dummy data
const DUMMY_PROFILES = [
  {
    id: "1",
    name: "Sarah",
    age: 28,
    bio: "Adventure seeker 🌎 | Coffee addict ☕️ | Dog lover 🐕",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    ],
  },
  {
    id: "2",
    name: "Michael",
    age: 32,
    bio: "Photographer 📸 | Foodie 🍜 | Always up for a hike 🏔",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    ],
  },
  {
    id: "3",
    name: "Emma",
    age: 26,
    bio: "Art lover 🎨 | Plant mom 🌿 | Yoga enthusiast 🧘‍♀️",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    ],
  },
];

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSpark = () => {
    // TODO: Implement spark feature
    console.log("Spark!");
  };

  const handleLike = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, DUMMY_PROFILES.length - 1));
  };

  const handleDislike = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, DUMMY_PROFILES.length - 1));
  };

  if (currentIndex >= DUMMY_PROFILES.length) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineMedium">No more profiles</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Check back later for more matches!
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {DUMMY_PROFILES.map((profile, index) => {
        if (index < currentIndex) return null;
        
        return (
          <SwipeableCard
            key={profile.id}
            {...profile}
            onSpark={handleSpark}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        );
      }).reverse()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
});
