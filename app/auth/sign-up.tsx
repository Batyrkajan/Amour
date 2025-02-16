import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { Link, router } from "expo-router";
import { supabase } from "../../config/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      router.replace('/onboarding/quiz');
    } catch (error: any) {
      setError(error.message || "Failed to create account");
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Account
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleSignUp}
          loading={loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        <View style={styles.socialButtons}>
          <Button
            mode="outlined"
            icon="google"
            onPress={() => {
              /* TODO: Implement Google sign up */
            }}
            style={styles.socialButton}
          >
            Google
          </Button>

          <Button
            mode="outlined"
            icon="apple"
            onPress={() => {
              /* TODO: Implement Apple sign up */
            }}
            style={styles.socialButton}
          >
            Apple
          </Button>
        </View>

        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <Link href="/auth/sign-in">
            <Text style={styles.link}>Sign In</Text>
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
  error: {
    color: "red",
    marginTop: 8,
  },
});
