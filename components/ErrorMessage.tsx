import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: "#FF3B30",
    marginBottom: 16,
  },
}); 