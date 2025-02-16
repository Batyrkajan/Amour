import React from "react";
import { View, StyleSheet, Image, Dimensions, Pressable } from "react-native";
import { Text, Button, IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type ProfileCardProps = {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  onSpark?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
};

export default function ProfileCard({
  name,
  age,
  bio,
  photos,
  onSpark,
  onLike,
  onDislike,
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
    }
  };

  const previousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photos[currentPhotoIndex] }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Photo Navigation */}
      <Pressable style={styles.leftHalf} onPress={previousPhoto} />
      <Pressable style={styles.rightHalf} onPress={nextPhoto} />

      {/* Photo Indicators */}
      <View style={styles.indicators}>
        {photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentPhotoIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Profile Info */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.info}>
          <Text variant="headlineMedium" style={styles.name}>
            {name}, {age}
          </Text>
          <Text variant="bodyLarge" style={styles.bio}>
            {bio}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <IconButton
            icon="close"
            mode="contained"
            size={30}
            onPress={onDislike}
            containerColor="white"
            iconColor="#FF3B30"
          />
          <Button
            mode="contained"
            icon="fire"
            onPress={onSpark}
            style={styles.sparkButton}
          >
            Spark
          </Button>
          <IconButton
            icon="heart"
            mode="contained"
            size={30}
            onPress={onLike}
            containerColor="white"
            iconColor="#34C759"
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: height - 120, // Adjust based on your tab bar height
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  leftHalf: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },
  rightHalf: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },
  indicators: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
  },
  info: {
    padding: 16,
  },
  name: {
    color: "white",
    marginBottom: 8,
  },
  bio: {
    color: "white",
    opacity: 0.9,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sparkButton: {
    paddingHorizontal: 32,
  },
});
