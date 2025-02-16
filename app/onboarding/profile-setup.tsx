import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImagePicker from "expo-image-picker";
import * as VideoInfo from "expo-media-library";
import PhotoUploader from "@/components/PhotoUploader";
import { ErrorMessage } from "@/components/ErrorMessage";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/auth";

type ValidationErrors = {
  name?: string;
  photos?: string;
  bio?: string;
  video?: string;
  submit?: string;
};

export default function ProfileSetupScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets[0].uri) {
        const asset = await VideoInfo.createAssetAsync(result.assets[0].uri);
        const duration = asset.duration;

        if (duration > 31) {
          setErrors((prev) => ({
            ...prev,
            video: "Video must be 30 seconds or less",
          }));
          return;
        }

        const { uri } = await VideoThumbnails.getThumbnailAsync(
          result.assets[0].uri,
          {
            time: 0,
          }
        );

        setVideoUri(result.assets[0].uri);
        setVideoThumbnail(uri);
        setErrors((prev) => ({ ...prev, video: undefined }));
      }
    } catch (error) {
      console.error("Error picking video:", error);
      setErrors((prev) => ({
        ...prev,
        video: "Error selecting video. Please try again.",
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (photos.length === 0) {
      newErrors.photos = "At least one photo is required";
    }

    if (!bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      let videoUrl = null;
      if (videoUri) {
        const videoResponse = await fetch(videoUri);
        const videoBlob = await videoResponse.blob();
        const videoFileName = `${session?.user.id}/video-${Date.now()}`;

        const { error: videoError } = await supabase.storage
          .from("profile-videos")
          .upload(videoFileName, videoBlob);

        if (videoError) throw videoError;
        videoUrl = supabase.storage
          .from("profile-videos")
          .getPublicUrl(videoFileName).data.publicUrl;
      }

      const photoUrls = await Promise.all(
        photos.map(async (uri) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const fileName = `${session?.user.id}/photo-${Date.now()}`;

          const { error } = await supabase.storage
            .from("profile-photos")
            .upload(fileName, blob);

          if (error) throw error;
          return supabase.storage.from("profile-photos").getPublicUrl(fileName)
            .data.publicUrl;
        })
      );

      const { error } = await supabase.from("profiles").insert({
        user_id: session?.user.id,
        name,
        bio,
        gender,
        photos: photoUrls,
        video_intro: videoUrl,
        heat_score: 0,
        flame_customization: {
          color: "#FF4B4B",
          size: 1,
          intensity: 1,
        },
      });

      if (error) throw error;
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error creating profile:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Error creating profile. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Your Profile
      </Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={!!errors.name}
        style={styles.input}
      />
      {errors.name && <ErrorMessage message={errors.name} />}

      <SegmentedButtons
        value={gender}
        onValueChange={setGender as (value: string) => void}
        buttons={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ]}
        style={styles.gender}
      />

      <PhotoUploader
        photos={photos}
        onPhotosChange={(newPhotos) => {
          setPhotos(newPhotos);
          setErrors((prev) => ({ ...prev, photos: undefined }));
        }}
      />
      {errors.photos && <ErrorMessage message={errors.photos} />}

      <View style={styles.videoSection}>
        <Text variant="titleMedium">Video Introduction (Optional)</Text>
        <Text variant="bodySmall" style={styles.videoHint}>
          Record a 30-second video to introduce yourself
        </Text>

        {videoUri ? (
          <View style={styles.videoPreview}>
            {videoThumbnail && (
              <Image
                source={{ uri: videoThumbnail }}
                style={styles.thumbnail}
              />
            )}
            <IconButton
              icon="close-circle"
              size={20}
              style={styles.removeVideo}
              onPress={() => {
                setVideoUri(null);
                setVideoThumbnail(null);
              }}
            />
          </View>
        ) : (
          <Button
            mode="outlined"
            icon="video-plus"
            onPress={pickVideo}
            style={styles.videoButton}
          >
            Add Video
          </Button>
        )}
        {errors.video && <ErrorMessage message={errors.video} />}
      </View>

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={(text) => {
          setBio(text);
          setErrors((prev) => ({ ...prev, bio: undefined }));
        }}
        error={!!errors.bio}
        multiline
        numberOfLines={4}
        style={styles.input}
      />
      {errors.bio && <ErrorMessage message={errors.bio} />}

      {errors.submit && <ErrorMessage message={errors.submit} />}

      <Button
        mode="contained"
        onPress={handleComplete}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Complete Profile
      </Button>
    </ScrollView>
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
  input: {
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  gender: {
    marginBottom: 24,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoHint: {
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.7,
  },
  videoButton: {
    marginTop: 8,
  },
  videoPreview: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  removeVideo: {
    position: "absolute",
    top: 8,
    right: 8,
    margin: 0,
    backgroundColor: "white",
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});
