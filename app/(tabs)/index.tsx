import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
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
import { cardStyles, styles, swipeStyles } from "../(styles)/index.css";

type TimelineItem = Database["public"]["Tables"]["timelines"]["Row"];
type SwipeHandlers = {
  onSwipe?: (id: string, direction: string) => void;
  onCardLeftScreen?: (id: string) => void;
  onOpen?: (item: TimelineItem) => void;
};

function RemoteSizedImage({
  uri,
  containerWidth,
  maxHeight = null,
  contain = false,
  useCardPadding = true,
}: {
  uri: string;
  containerWidth: number;
  maxHeight?: number | null;
  contain?: boolean;
  useCardPadding?: boolean;
}) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (!mounted) return;
        const calculated = Math.round((containerWidth * h) / w);
        setHeight(maxHeight ? Math.min(calculated, maxHeight) : calculated);
      },
      () => {
        if (!mounted) return;
        setHeight(Math.round((containerWidth * 9) / 16));
      },
    );
    return () => {
      mounted = false;
    };
  }, [uri, containerWidth, maxHeight]);

  if (height == null) return null;

  const flattened = StyleSheet.flatten(cardStyles.card) as any;
  const CARD_PADDING =
    typeof flattened?.padding === "number" ? flattened.padding : 16;
  const imageWidth = useCardPadding
    ? Math.max(0, containerWidth - CARD_PADDING * 2)
    : containerWidth;

  return (
    <Image
      source={{ uri }}
      style={{
        width: imageWidth,
        height,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: "center",
      }}
      resizeMode={contain ? "contain" : "cover"}
    />
  );
}

function TimelineCard({
  item,
  onOpen,
}: {
  item: TimelineItem;
  onOpen?: (item: TimelineItem) => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const cardHeight = Math.round(windowHeight * 0.6);
  const maxImageHeight = Math.round(windowHeight * 0.35);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [author, setAuthor] = useState<{
    name?: string | null;
    icon_url?: string | null;
  } | null>(null);
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
    <Pressable onPress={() => onOpen?.(item)}>
      <View
        style={[cardStyles.card, { height: cardHeight, overflow: "hidden" }]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (!containerWidth) setContainerWidth(w);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {loadingAuthor ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              {author?.icon_url ? (
                <Image
                  source={{ uri: author.icon_url as string }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginRight: 8,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#ddd",
                    marginRight: 8,
                  }}
                />
              )}
              <ThemedText style={{ fontSize: 14 }} darkColor="#000">
                {author?.name ?? "投稿者"}
              </ThemedText>
            </>
          )}
        </View>

        <ThemedText type="subtitle" darkColor="#000">{item.title ?? "No title"}</ThemedText>
        <ThemedText numberOfLines={5} ellipsizeMode="tail" darkColor="#000">
          {item.description ?? ""}
        </ThemedText>

        {item.attachments &&
          item.attachments.length > 0 &&
          containerWidth != null && (
            <RemoteSizedImage
              uri={item.attachments[0]}
              containerWidth={containerWidth}
              maxHeight={maxImageHeight}
            />
          )}
      </View>
    </Pressable>
  );
}

function TimelineSwiper({
  items,
  onSwipe,
  onCardLeftScreen,
  onOpen,
}: { items: TimelineItem[] } & SwipeHandlers) {
  const { height: windowHeight } = useWindowDimensions();
  const containerMinHeight = Math.round(windowHeight * 0.8);
  const [stack, setStack] = useState<TimelineItem[]>(items);

  useEffect(() => {
    setStack(items);
  }, [items]);

  const handleCardLeftInternal = (id: string) => {
    setStack((s) => s.filter((x) => x.id !== id));
    onCardLeftScreen?.(id);
  };

  return (
    <View
      style={[
        swipeStyles.container,
        { position: "relative", minHeight: containerMinHeight },
      ]}
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
              preventSwipe={["up", "down"]}
              onSwipe={(dir: string) => onSwipe?.(item.id, dir)}
              onCardLeftScreen={() => handleCardLeftInternal(item.id)}
            >
              <TimelineCard item={item} onOpen={onOpen} />
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
  const { height: windowHeight } = useWindowDimensions();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostBanner, setNewPostBanner] = useState<string | null>(null);

  const fetchTimelines = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { data, error } = await supabase
          .from("timelines")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setItems((data as unknown as TimelineItem[]) || []);
        return;
      }

      const { data: myLikes, error: likesError } = await supabase
        .from("likes")
        .select("timeline_id")
        .eq("user_id", user.id);
      if (likesError) throw likesError;
      const swipedIds = myLikes?.map((l) => l.timeline_id) || [];

      let query = supabase
        .from("timelines")
        .select("*")
        .order("created_at", { ascending: false });
      if (swipedIds.length > 0)
        query = query.not("id", "in", `(${swipedIds.join(",")})`);

      const { data, error } = await query;
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
    const channel = supabase
      .channel("public:timelines")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "timelines" },
        (payload) => {
          try {
            const newRow = payload.new as TimelineItem;
            setItems((prev) => [newRow, ...prev]);
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

  const handleSwipe = async (id: string, direction: string) => {
    console.log("swiped detected:", id, direction);
    const type = direction === "right" ? "like" : "skip";
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, timeline_id: id, type });
      if (error) {
        if (error.code !== "23505") console.error("スワイプ保存エラー", error);
      } else {
        console.log(`Saved ${type} for post ${id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCardLeft = (id: string) => {
    console.log("card left screen completely", id);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [modalInnerWidth, setModalInnerWidth] = useState<number | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const _flattenedCard = StyleSheet.flatten(cardStyles.card) as any;
  const CARD_PADDING =
    typeof _flattenedCard?.padding === "number" ? _flattenedCard.padding : 16;
  const EXTRA_PADDING = 16;

  const openCreate = async () => {
    setCheckingProfile(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
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
            { text: "設定する", onPress: () => router.push("/settings") },
          ],
        );
        return;
      }
      setModalVisible(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        Alert.alert("エラー", e.message || String(e));
      }
    } finally {
      setCheckingProfile(false);
    }
  };
  const closeCreate = () => setModalVisible(false);

  const openPost = (item: TimelineItem) => {
    setSelectedItem(item);
    setPostModalVisible(true);
  };
  const closePost = () => {
    setSelectedItem(null);
    setPostModalVisible(false);
  };

  const handleSubmit = async (
    title: string,
    description: string,
    imageUrls: string[] | null,
  ) => {
    console.log("posting", { title, description });
    const userId = (await supabase.auth.getUser()).data.user?.id || "";
    const res = await supabase
      .from("timelines")
      .insert({ title, description, author: userId, attachments: imageUrls });
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText type="title" style={{ marginRight: 8 }}>
              タイムライン
            </ThemedText>

            {/* リロードアイコン */}
            <Pressable onPress={fetchTimelines}>
              <MaterialIcons name="refresh" size={24} color="#666" />
            </Pressable>
          </View>
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
            { paddingTop: 8 + insets.top, minHeight: 720 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <TimelineSwiper
              items={items}
              onSwipe={handleSwipe}
              onCardLeftScreen={handleCardLeft}
              onOpen={openPost}
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

      <Modal
        visible={postModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePost}
      >
        <ThemedView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: CARD_PADDING + EXTRA_PADDING,
          }}
        >
          <ThemedView
            style={{
              width: "100%",
              maxHeight: "90%",
              borderRadius: 8,
              padding: CARD_PADDING + EXTRA_PADDING,
              backgroundColor: "#fff",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <ThemedText type="title" darkColor="#000">
                {selectedItem?.title ?? "投稿"}
              </ThemedText>
              <Pressable onPress={closePost} accessibilityRole="button">
                <MaterialIcons name="close" size={24} color="#333" />
              </Pressable>
            </View>
            <ScrollView>
              <View
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (!modalInnerWidth) setModalInnerWidth(w);
                }}
              >
                {selectedItem?.attachments &&
                  selectedItem.attachments.length > 0 &&
                  modalInnerWidth != null && (
                    <RemoteSizedImage
                      uri={selectedItem.attachments[0]}
                      containerWidth={modalInnerWidth}
                      maxHeight={Math.round(windowHeight * 0.8)}
                      contain={true}
                      useCardPadding={false}
                    />
                  )}

                <ThemedText darkColor="#000">{selectedItem?.description ?? ""}</ThemedText>
              </View>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}
