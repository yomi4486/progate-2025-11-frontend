import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { styles } from "../(styles)/account.css";

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
  const [isRefreshing, setIsRefreshing] = useState(false); // リフレッシュ状態を管理
  const [profile, setProfile] = useState<{
    name?: string | null;
    bio?: string | null;
    icon_url?: string | null;
    id?: string | null;
  } | null>(null);
  const [posts, setPosts] = useState<TimelineItem[]>([]);
  // 20251122追加: いいねした投稿を管理するstate
  const [likedPosts, setLikedPosts] = useState<TimelineItem[]>([]);

  // データ取得関数
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.replace({ pathname: "/login" });
        return;
      }

      // プロフィールの取得
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("id,name,bio,icon_url")
        .eq("id", user.id)
        .single();
      if (profileError && profileError.code !== "PGRST116") throw profileError;
      setProfile(profileData ?? { id: user.id });

      // 自分の投稿を取得
      const { data: timelineData, error: timelineError } = await supabase
        .from("timelines")
        .select("*")
        .eq("author", user.id)
        .order("created_at", { ascending: false });
      if (timelineError) throw timelineError;

      // いいねした投稿を取得
      const { data: likedData, error: likedError } = await supabase
        .from("likes")
        .select(
          `
        timelines (
          *
        )
      `,
        )
        .eq("user_id", user.id)
        .eq("type", "like")
        .order("created_at", { ascending: false });
      if (likedError) throw likedError;

      const formattedLikedPosts = likedData
        ?.map((item) => item.timelines)
        .filter((t) => t !== null) as unknown as TimelineItem[];

      setPosts((timelineData as unknown as TimelineItem[]) || []);
      setLikedPosts(formattedLikedPosts || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Account load failed", e);
        Alert.alert("エラー", e.message || String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  // リフレッシュ時の処理
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const renderPostList = (items: TimelineItem[], emptyText: string) => {
    if (items.length === 0) {
      return <ThemedText style={{ marginTop: 8 }}>{emptyText}</ThemedText>;
    }
    return items.map((p) => (
      <View
        key={p.id}
        style={{
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <ThemedText type="subtitle" style={{ fontSize: 16 }}>
          {p.title ?? "No Title"}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
          {p.description}
        </ThemedText>
      </View>
    ));
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
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
          <ThemedView style={{ padding: 16, paddingBottom: 40 }}>
            {/* プロフィール情報 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
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
              <View style={{ flex: 1 }}>
                <ThemedText type="title">
                  {profile?.name ?? "あなたのアカウント"}
                </ThemedText>
                {profile?.bio ? (
                  <ThemedText style={{ marginTop: 4 }}>
                    {profile.bio}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            {/* 自分の投稿セクション */}
            <View style={{ marginBottom: 24 }}>
              <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                あなたの投稿
              </ThemedText>
              {renderPostList(posts, "まだ投稿がありません。")}
            </View>

            {/* いいねした投稿セクション */}
            <View>
              <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                いいねした投稿
              </ThemedText>
              {renderPostList(
                likedPosts,
                "まだ「いいね」した投稿はありません。",
              )}
            </View>
          </ThemedView>
        )}
      </ParallaxScrollView>
    </ScrollView>
  );
}
