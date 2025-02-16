import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Text, IconButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PhotoUploaderProps = {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
};

export default function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}: PhotoUploaderProps) {
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        onPhotosChange([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Add Photos ({photos.length}/{maxPhotos})
      </Text>
      <View style={styles.grid}>
        {[...Array(maxPhotos)].map((_, index) => (
          <View key={index} style={styles.photoContainer}>
            {photos[index] ? (
              <Pressable onLongPress={() => removePhoto(index)}>
                <Image source={{ uri: photos[index] }} style={styles.photo} />
                <IconButton
                  icon="close-circle"
                  size={20}
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                />
              </Pressable>
            ) : (
              <Pressable
                style={styles.addButton}
                onPress={pickImage}
                disabled={photos.length >= maxPhotos}
              >
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={32}
                  color={photos.length >= maxPhotos ? "#ccc" : "#666"}
                />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <Text variant="bodySmall" style={styles.hint}>
        Tip: Long press a photo to remove it
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoContainer: {
    width: "31%",
    aspectRatio: 1,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  addButton: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    margin: 0,
    backgroundColor: "white",
  },
  hint: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
}); 