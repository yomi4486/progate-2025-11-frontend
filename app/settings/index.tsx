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

type Profile = Database["public"]["Tables"]["users"]["Row"];

export default function SettingsScreen() {
  const router = useRouter();
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

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
    
        // データがないエラー(PGRST116)は無視してOK
        if (error && error.code !== "PGRST116") throw error;
        
        if (data && mounted) {
          setProfile({
            name: data.name ?? "",
            bio: data.bio ?? "",
            id: data.id ?? "",
            // 修正: キャッシュ対策を追加（初期表示時）
            icon_url: data.icon_url 
              ? `${data.icon_url}?t=${new Date().getTime()}` 
              : "",
          });
        }
      } catch (e: unknown) {
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
        name: profile.name ?? "", // ここはnameがあるのでOK
        bio: profile.bio ?? null,
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
      if (res.canceled || !res.assets || res.assets.length === 0) return;
      
      const uri = res.assets[0].uri;

      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const extMatch = uri.split(".").pop()?.split("?")[0] ?? "png";
      const filename = `${user.id}.${extMatch}`;
      const path = `${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("user_icons")
        .upload(path, uint8, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user_icons")
        .getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // 202511221100_修正追加_upsertに必須項目の name (と bio) を追加
      const { error: upsertError } = await supabase
        .from("users")
        .upsert({ 
            id: user.id, 
            icon_url: publicUrl,
            name: profile.name || "ゲスト", // 必須：現在の名前
            bio: profile.bio // 推奨：現在の自己紹介も維持
        });
      
      if (upsertError) throw upsertError;

      // 2025112211100_URLの後ろに時間を付けることで、Imageコンポーネントに「新しい画像だ」と認識させる
      setProfile((p) => ({ 
        ...(p ?? {}), 
        icon_url: `${publicUrl}?t=${new Date().getTime()}` 
      }));
      
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
          // keyを変えることで強制再描画
          key={profile.icon_url}
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
      <Button title="アイコンを選択" onPress={handlePickImage} />

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