import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function ProfileSetupScreen() {
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleComplete = () => {
    // TODO: Save profile data to backend
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Your Profile
      </Text>

      <View style={styles.photoSection}>
        <Text variant="titleMedium">Add Photos</Text>
        <View style={styles.photoGrid}>
          {[...Array(6)].map((_, index) => (
            <Button
              key={index}
              mode="outlined"
              style={styles.photoButton}
              onPress={pickImage}
            >
              {photos[index] ? (
                <Image source={{ uri: photos[index] }} style={styles.photo} />
              ) : (
                "+"
              )}
            </Button>
          ))}
        </View>
      </View>

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        style={styles.bioInput}
      />

      <Button mode="contained" onPress={handleComplete} style={styles.button}>
        Complete Profile
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 32,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photoButton: {
    width: "31%",
    aspectRatio: 1,
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  bioInput: {
    backgroundColor: "transparent",
    marginBottom: 24,
  },
  button: {
    marginTop: "auto",
  },
});
