import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import ProfileCard from "./ProfileCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type SwipeableCardProps = {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  onSpark: () => void;
  onLike: () => void;
  onDislike: () => void;
};

export default function SwipeableCard({
  onLike,
  onDislike,
  ...profile
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / SCREEN_WIDTH * 15; // -15 to 15 degrees
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe completed
        translateX.value = withSpring(Math.sign(event.translationX) * SCREEN_WIDTH * 1.5);
        translateY.value = withSpring(event.translationY);
        
        // Trigger appropriate callback
        if (event.translationX > 0) {
          runOnJS(onLike)();
        } else {
          runOnJS(onDislike)();
        }
      } else {
        // Reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <ProfileCard {...profile} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
}); 