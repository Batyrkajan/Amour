import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

export function TypingIndicator() {
  const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    dots.forEach((dot, index) => {
      dot.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );
    });

    return () => {
      dots.forEach(dot => cancelAnimation(dot));
    };
  }, []);

  const dotStyles = dots.map(dot =>
    useAnimatedStyle(() => ({
      opacity: dot.value,
      transform: [{ scale: 0.8 + dot.value * 0.2 }],
    }))
  );

  return (
    <View style={styles.container}>
      {dotStyles.map((style, index) => (
        <Animated.View key={index} style={[styles.dot, style]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#999",
  },
}); 