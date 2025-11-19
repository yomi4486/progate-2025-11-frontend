import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, View } from "react-native";
import { styles } from "./account.css";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

type TimelineItem = Database["public"]["Tables"]["timelines"]["Row"];

export default function AccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name?: string | null;
    bio?: string | null;
    icon_url?: string | null;
    id?: string | null;
  } | null>(null);
  const [posts, setPosts] = useState<TimelineItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("id,name,bio,icon_url")
          .eq("id", user.id)
          .single();
        if (profileError && profileError.code !== "PGRST116")
          throw profileError;
        if (!mounted) return;
        setProfile(profileData ?? { id: user.id });

        const { data: timelineData, error: timelineError } = await supabase
          .from("timelines")
          .select("*")
          .eq("author", user.id)
          .order("created_at", { ascending: false });
        if (timelineError) throw timelineError;
        if (!mounted) return;
        setPosts((timelineData as unknown as TimelineItem[]) || []);
      } catch (e: any) {
        console.error("Account load failed", e);
        Alert.alert("エラー", e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={200}
          color="#808080"
          name="person.crop.circle"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          アカウント
        </ThemedText>
        <Button title="設定" onPress={() => router.push("/settings")} />
      </ThemedView>

      {loading ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ThemedView style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {profile?.icon_url ? (
              <Image
                source={{ uri: profile.icon_url }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  marginRight: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "#ddd",
                  marginRight: 12,
                }}
              />
            )}
            <View>
              <ThemedText type="title">
                {profile?.name ?? "あなたのアカウント"}
              </ThemedText>
              {profile?.bio ? <ThemedText>{profile.bio}</ThemedText> : null}
            </View>
          </View>

          <ThemedText type="subtitle">あなたの投稿</ThemedText>
          {posts.length === 0 ? (
            <ThemedText>まだ投稿がありません。</ThemedText>
          ) : (
            posts.map((p) => (
              <View
                key={p.id}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <ThemedText type="subtitle">{p.title}</ThemedText>
                <ThemedText>{p.description}</ThemedText>
              </View>
            ))
          )}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}
