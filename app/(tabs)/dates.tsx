import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function DatesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Date Planning</Text>
      {/* TODO: Add AI date planner interface */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 