import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FAB } from "@/components/ui/fab";
import { FloatingModal } from "@/components/ui/post-modal";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import TinderCard from "react-tinder-card";
import { cardStyles, styles, swipeStyles } from "./index.css";

type TimelineItem = Database["public"]["Tables"]["timelines"]["Row"];

function TimelineCard({ item }: { item: TimelineItem }) {
  const [author, setAuthor] = useState<{ name?: string | null; icon_url?: string | null } | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!item?.author) return;
      setLoadingAuthor(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("name, icon_url")
          .eq("id", item.author)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setAuthor({ name: data.name ?? null, icon_url: data.icon_url ?? null });
      } catch (e) {
        console.error("Failed to fetch author", e);
      } finally {
        if (mounted) setLoadingAuthor(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [item?.author]);

  return (
    <View style={cardStyles.card} key={item.id}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        {loadingAuthor ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            {author?.icon_url ? (
              <Image
                source={{ uri: author.icon_url as string }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }}
              />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#ddd", marginRight: 8 }} />
            )}
            <ThemedText style={{ fontSize: 14 }}>{author?.name ?? "投稿者"}</ThemedText>
          </>
        )}
      </View>

      <ThemedText type="subtitle">{item.title ?? "No title"}</ThemedText>
      <ThemedText>{item.description ?? ""}</ThemedText>
    </View>
  );
}

type SwipeHandlers = {
  onSwipe?: (id: string, direction: string) => void;
  onCardLeftScreen?: (id: string) => void;
};

function TimelineSwiper({
  items,
  onSwipe,
  onCardLeftScreen,
}: { items: TimelineItem[] } & SwipeHandlers) {
  // Keep local stack so we can remove swiped cards and let the next card be interactive
  const [stack, setStack] = React.useState<TimelineItem[]>(items);

  React.useEffect(() => {
    setStack(items);
  }, [items]);

  const handleCardLeftInternal = (id: string) => {
    setStack((s) => s.filter((x) => x.id !== id));
    onCardLeftScreen?.(id);
  };

  return (
    <View
      style={[swipeStyles.container, { position: "relative", minHeight: 420 }]}
    >
      {stack.map((item, idx) => {
        const zIndex = stack.length - idx;
        const offsetTop = idx * 8;

        return (
          <View
            key={item.id}
            style={[swipeStyles.cardWrapper, { zIndex, top: offsetTop }]}
          >
            <TinderCard
              onSwipe={(dir: string) => onSwipe?.(item.id, dir)}
              onCardLeftScreen={() => handleCardLeftInternal(item.id)}
            >
              <TimelineCard item={item} />
            </TinderCard>
          </View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostBanner, setNewPostBanner] = useState<string | null>(null);

  const fetchTimelines = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("timelines")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data as unknown as TimelineItem[]) || []);
    } catch (err) {
      console.error("Failed to fetch timelines", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  useEffect(() => {
    // Subscribe to realtime inserts on timelines
    const channel = supabase
      .channel("public:timelines")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "timelines" },
        (payload) => {
          try {
            const newRow = payload.new as TimelineItem;
            // Prepend to local items so UI updates immediately
            setItems((prev) => [newRow, ...prev]);
            // Show banner message for 5 seconds
            setNewPostBanner("新しい投稿があります！");
            setTimeout(() => setNewPostBanner(null), 5000);
          } catch (e) {
            console.error("Realtime payload handling failed", e);
          }
        },
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (_) {
        /* ignore */
      }
    };
  }, []);

  const handleSwipe = (id: string, direction: string) => {
    // small abstraction: future logic (save vote, analytics) goes here
    console.log("swiped", id, direction);
  };

  const handleCardLeft = (id: string) => {
    console.log("card left screen", id);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const openCreate = async () => {
    setCheckingProfile(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // not authenticated -> go to login
        router.push("/login");
        return;
      }

      // check if profile exists in `users` table
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .limit(1);
      if (error) throw error;
      const exists = Array.isArray(data) ? data.length > 0 : !!data;
      if (!exists) {
        Alert.alert(
          "プロフィールが必要",
          "投稿にはプロフィールが必要です。プロフィールを設定しますか？",
          [
            { text: "いいえ", style: "cancel" },
            {
              text: "設定する",
              onPress: () => router.push("/settings"),
            },
          ],
        );
        return;
      }

      setModalVisible(true);
    } catch (e: any) {
      console.error(e);
      Alert.alert("エラー", e.message || String(e));
    } finally {
      setCheckingProfile(false);
    }
  };
  const closeCreate = () => setModalVisible(false);

  const handleSubmit = async (title: string, description: string) => {
    console.log("posting", { title, description });
    const userId = (await supabase.auth.getUser()).data.user?.id || "";
    console.log(userId)
    const res = await supabase.from("timelines").insert({
      title,
      description,
      author: userId
    });
    console.log("insert result", res);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {checkingProfile && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 2000,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {newPostBanner ? (
        <ThemedView
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: insets.top + 8,
            zIndex: 1100,
            alignItems: "center",
          }}
        >
          <ThemedView
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: "rgba(0,0,0,0.7)",
            }}
          >
            <ThemedText style={{ color: "#fff" }}>{newPostBanner}</ThemedText>
          </ThemedView>
        </ThemedView>
      ) : null}
      <ParallaxScrollView
        scrollEnabled={false}
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={null}
      >
        <ThemedView
          style={[
            styles.titleContainer,
            { paddingTop: insets.top, justifyContent: "space-between" },
          ]}
        >
          <ThemedText type="title">タイムライン</ThemedText>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
          >
            <MaterialIcons name="settings" size={24} color="#666" />
          </Pressable>
        </ThemedView>

        <ThemedView
          style={[
            styles.stepContainer,
            styles.centerFill,
            { paddingTop: 8 + insets.top },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <TimelineSwiper
              items={items}
              onSwipe={handleSwipe}
              onCardLeftScreen={handleCardLeft}
            />
          )}
        </ThemedView>
      </ParallaxScrollView>
      <FAB onPress={openCreate} />
      <FloatingModal
        visible={modalVisible}
        onClose={closeCreate}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}
