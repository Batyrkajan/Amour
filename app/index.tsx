import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>FlameLink</Text>
      <View style={styles.buttonContainer}>
        <Link href="/auth/sign-in" asChild>
          <Button mode="contained" style={styles.button}>
            Sign In
          </Button>
        </Link>
        <Link href="/auth/sign-up" asChild>
          <Button mode="outlined" style={styles.button}>
            Create Account
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    width: '100%',
  },
}); 