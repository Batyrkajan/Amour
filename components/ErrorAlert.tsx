import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import { AIError } from "@/services/ai";

type ErrorAlertProps = {
  error: AIError | null;
  onDismiss: () => void;
  onRetry?: () => void;
};

export function ErrorAlert({ error, onDismiss, onRetry }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Portal>
      <Dialog visible={!!error} onDismiss={onDismiss}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text>{error.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Dismiss</Button>
          {error.shouldRetry && onRetry && (
            <Button mode="contained" onPress={onRetry}>
              Retry
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
} 