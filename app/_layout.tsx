import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/LoadingScreen";

// Ensure user is authenticated for protected routes
function AuthGuard() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!session && !inAuthGroup && !inOnboardingGroup) {
      // Redirect to sign-in if not authenticated
      router.replace("/auth/sign-in");
    } else if (session && inAuthGroup) {
      // Redirect to main app if authenticated and trying to access auth screens
      router.replace("/(tabs)");
    }
  }, [session, loading, segments]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <AuthGuard />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
