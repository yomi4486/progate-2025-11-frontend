import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

export function FloatingModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
}) {
  const colorScheme = useColorScheme();
  const modalBg = useThemeColor({}, "background");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const submit = () => {
    onSubmit(title, description);
    setTitle("");
    setDescription("");
    onClose();
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
            >
              <ThemedText style={{ color: "#fff" }}>投稿</ThemedText>
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
});
