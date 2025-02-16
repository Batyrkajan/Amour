import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Slider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlameAnimation } from "./FlameAnimation";

type FlameCustomization = {
  color: string;
  size: number;
  intensity: number;
};

type FlameCustomizerProps = {
  customization: FlameCustomization;
  onChange: (customization: FlameCustomization) => void;
};

const FLAME_COLORS = ["#FF4B4B", "#FFB800", "#00E0FF", "#FF00E5"];

export function FlameCustomizer({ customization, onChange }: FlameCustomizerProps) {
  return (
    <View style={styles.container}>
      <FlameAnimation
        color={customization.color}
        size={customization.size}
        intensity={customization.intensity}
      />

      <View style={styles.controls}>
        <Text variant="titleMedium">Flame Color</Text>
        <View style={styles.colorPicker}>
          {FLAME_COLORS.map((color) => (
            <Button
              key={color}
              mode={customization.color === color ? "contained" : "outlined"}
              onPress={() => onChange({ ...customization, color })}
              style={[styles.colorButton, { backgroundColor: color }]}
            />
          ))}
        </View>

        <Text variant="titleMedium">Size</Text>
        <Slider
          value={customization.size}
          onValueChange={(value) => onChange({ ...customization, size: value })}
          minimumValue={0.5}
          maximumValue={1.5}
          step={0.1}
        />

        <Text variant="titleMedium">Intensity</Text>
        <Slider
          value={customization.intensity}
          onValueChange={(value) =>
            onChange({ ...customization, intensity: value })
          }
          minimumValue={0.5}
          maximumValue={1.5}
          step={0.1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  controls: {
    gap: 16,
  },
  colorPicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
}); 