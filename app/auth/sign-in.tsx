import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { Link, router } from "expo-router";
import { supabase } from "../../config/supabase";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          error={!!error}
          disabled={loading}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          style={styles.input}
          error={!!error}
          disabled={loading}
        />

        {error && (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          Sign In
        </Button>

        <View style={styles.socialButtons}>
          <Button
            mode="outlined"
            icon="google"
            onPress={() => {
              /* TODO: Implement Google sign in */
            }}
            style={styles.socialButton}
          >
            Google
          </Button>

          <Button
            mode="outlined"
            icon="apple"
            onPress={() => {
              /* TODO: Implement Apple sign in */
            }}
            style={styles.socialButton}
          >
            Apple
          </Button>
        </View>

        <View style={styles.footer}>
          <Text>Don't have an account? </Text>
          <Link href="/auth/sign-up">
            <Text style={styles.link}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#1a73e8",
  },
});
