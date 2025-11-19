import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

type Profile = Database["public"]["Tables"]["users"]["Row"];

export default function SettingsScreen() {
  const router = useRouter();
  // Use a partial Profile locally so we don't have to provide DB-managed fields like `created_at`.
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: "",
    bio: "",
    id: "",
    icon_url: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        // fetch profile from 'profiles' table if exists
        // `profiles` may not be present in the generated Database typing; use a safe any cast for runtime calls
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        if (data) {
          // Do not store DB-managed `created_at` locally; omit it so we don't send it back on upsert.
          setProfile({
            name: data.name ?? "",
            bio: data.bio ?? "",
            id: data.id ?? "",
            icon_url: data.icon_url ?? "",
          });
        }
      } catch (e: PostgrestError | unknown) {
        if (e instanceof PostgrestError && e["code"] == "PGRST116" && mounted) {
          // undefined table 'users'
          console.log("users table does not exist yet");
        } else {
          console.error(e);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // Omit `created_at` from updates so Postgres can apply its DEFAULT value.
      const updates = {
        id: user.id,
        name: profile.name ?? "",
        bio: profile.bio ?? null,
        icon_url: profile.icon_url ?? null,
      };
      const { error } = await supabase.from("users").upsert(updates);
      if (error) throw error;
      Alert.alert("保存しました");
    } catch (e: unknown) {
      if (e instanceof Error) Alert.alert("エラー", e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
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

      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // fetch file and convert to blob
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      console.log("picked-uri=", uri);
      console.log("arrayBuffer.byteLength=", arrayBuffer.byteLength);
      console.log("uint8.length=", uint8.length);

      // use uid as filename (without extension) to satisfy RLS check
      const extMatch = uri.split(".").pop()?.split("?")[0] ?? "png";
      const filename = `${user.id}.${extMatch}`;
      // when uploading to a bucket, the `path` should be relative to the bucket
      // do NOT include the bucket name again here. Use just the filename (or subpath).
      const path = `${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("user_icons")
        .upload(path, uint8, { upsert: true });
      if (uploadError) throw uploadError;

      // get public url
      const { data: urlData } = supabase.storage
        .from("user_icons")
        .getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // update local state and persist public URL to users.icon_url immediately
      setProfile((p) => ({ ...(p ?? {}), icon_url: publicUrl }));
      // Use upsert so we don't accidentally update all rows; upsert will insert
      // or update the row with this user's id.
      const { error: upsertError } = await supabase
        .from("users")
        .update({ icon_url: publicUrl })
        .eq("id", user.id);
      console.log("upsertError", upsertError);
      if (upsertError) throw upsertError;
      Alert.alert("保存しました", "アイコンを更新しました。");
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        Alert.alert("エラー", e.message || String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (e: unknown) {
      if (e instanceof Error) {
        Alert.alert("エラー", e.message || String(e));
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {profile.id ? "設定" : "プロフィールを設定しましょう"}
      </ThemedText>
      {profile?.icon_url ? (
        <Image
          source={{ uri: String(profile.icon_url) }}
          style={{ width: 96, height: 96, borderRadius: 48, marginTop: 12 }}
        />
      ) : (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#ddd",
            marginTop: 12,
          }}
        />
      )}
      <View style={{ height: 8 }} />
      <Button title="アイコンを編集" onPress={handlePickImage} />

      <TextInput
        placeholder="ユーザー名"
        value={profile.name}
        onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
        style={styles.input}
      />
      <TextInput
        placeholder="自己紹介"
        value={profile.bio || ""}
        onChangeText={(t) => setProfile((p) => ({ ...p, bio: t }))}
        style={[styles.input, styles.textarea]}
        multiline
      />
      <View style={{ height: 12 }} />
      <Button
        title={loading ? "保存中..." : "保存"}
        onPress={handleSave}
        disabled={loading}
      />
      <View style={{ height: 12 }} />
      <Button title="ログアウト" onPress={handleLogout} color="#d9534f" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20  ,alignItems: "center"},
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 12,
  },
  textarea: { height: 100, textAlignVertical: "top" },
});
