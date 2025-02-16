import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type FlameAnimationProps = {
  color?: string;
  size?: number;
  intensity?: number;
};

export function FlameAnimation({
  color = "#FF4B4B",
  size = 1,
  intensity = 1,
}: FlameAnimationProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1 + 0.2 * intensity, {
        duration: 1500 / intensity,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    opacity.value = withTiming(1, { duration: 1000 });
  }, [intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * size }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flame, animatedStyle]}>
        <MaterialCommunityIcons name="fire" size={120} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  flame: {
    alignItems: "center",
    justifyContent: "center",
  },
});
