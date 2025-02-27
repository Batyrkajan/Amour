import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quiz" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
} 