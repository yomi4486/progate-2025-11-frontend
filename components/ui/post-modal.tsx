import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export function FloatingModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    imageUrls: string[] | null,
  ) => void;
}) {
  const modalBg = useThemeColor({}, "background");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 画像のプレビュー用
  const [loading, setLoading] = useState(false);

  const UploadImage = async () => {
    try {
      // ask permission
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("権限が必要です", "写真へのアクセス権が必要です");
          return;
        }
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (res.canceled || res.canceled) return;
      const uri = res.assets?.[0]?.uri ?? res.assets[0].uri;
      if (!uri) return;

      setSelectedImage(uri); // プレビュー用に画像URIを保存
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        Alert.alert("エラー", e.message || String(e));
      }
    }
  };

  const submit = async () => {
    if (!title || !description) {
      Alert.alert("エラー", "タイトルと説明を入力してください");
      return;
    }

    setLoading(true);
    let imageUrl = null;

    try {
      if (selectedImage) {
        // 画像をアップロード
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const response = await fetch(selectedImage);
        const arrayBuffer = await response.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        const extMatch = selectedImage.split(".").pop()?.split("?")[0] ?? "png";
        const filename = `${user.id}-${Date.now()}.${extMatch}`;
        const path = `${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(path, uint8, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("attachments")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      // データベースに書き込み
      onSubmit(title, description, [imageUrl!]);
      setTitle("");
      setDescription("");
      setSelectedImage(null); // プレビューをリセット
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        Alert.alert("エラー", e.message || String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ThemedView style={[styles.modal, { backgroundColor: modalBg }]}>
          <ThemedText type="title">アイデア・作品・趣味などを投稿</ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
          />
          {/* attachments */}
          <View style={styles.iconContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.iconImage} />
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
            <View style={styles.iconOverlay}>
              <FontAwesome name="upload" onPress={UploadImage} size={24} />
            </View>
            {/* <Button title="画像を投稿" onPress={UploadImage} color="#d9534f" /> */}
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            style={[styles.input, styles.textarea]}
            multiline
          />
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.actionButton}>
              <ThemedText>キャンセル</ThemedText>
            </Pressable>
            <Pressable
              onPress={submit}
              style={[styles.actionButton, styles.primary]}
              disabled={loading}
            >
              <ThemedText style={{ color: "#fff" }}>
                {loading ? "投稿中..." : "投稿"}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modal: {
    width: "84%",
    maxWidth: 520,
    borderRadius: 12,
    padding: 18,
    gap: 12,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 96,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: "#2f95dc",
  },
  iconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 8,
  },
  iconContainer: {
    position: "relative",
    width: 96,
    height: 96,
    marginTop: 12,
  },
  iconPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ddd",
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },
});
