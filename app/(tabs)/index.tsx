import React, { useState } from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import ProfileCard from "@/components/ProfileCard";

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
    setCurrentIndex(prev => Math.min(prev + 1, DUMMY_PROFILES.length - 1));
  };

  const handleDislike = () => {
    setCurrentIndex(prev => Math.min(prev + 1, DUMMY_PROFILES.length - 1));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_PROFILES}
        renderItem={({ item }) => (
          <ProfileCard
            {...item}
            onSpark={handleSpark}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={Dimensions.get("window").height - 120}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
