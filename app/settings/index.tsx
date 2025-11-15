import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["users"]["Row"];

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    bio: "",
    id: "",
    created_at: "",
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
          setProfile({
            name: data.name ?? "",
            bio: data.bio ?? "",
            id: data.id ?? "",
            created_at: data.created_at ?? "",
            icon_url: data.icon_url ?? "",
          });
        }
      } catch (e) {
        console.error(e);
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
      const updates = {
        id: user.id,
        name: profile.name,
        bio: profile.bio,
        icon_url: profile.icon_url,
      };
      const { error } = await supabase.from("users").upsert(updates);
      if (error) throw error;
      Alert.alert("保存しました");
    } catch (e: any) {
      Alert.alert("エラー", e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("エラー", e.message || String(e));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">設定</ThemedText>
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
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 12,
  },
  textarea: { height: 100, textAlignVertical: "top" },
});
