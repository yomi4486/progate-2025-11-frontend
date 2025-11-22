import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [likers, setLikers] = useState<UserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // リフレッシュ状態を管理
  const [chatOpen, setChatOpen] = useState(false);
  const [otherUser, setOtherUser] = useState<UserRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const channelRef = useRef<any>(null);
  const listRef = useRef<FlatList<MessageRow> | null>(null);
  useEffect(() => {
    fetchLikers();
  }, []);

  const fetchLikers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      console.log("user:", data);
      const me = data.user;
      if (!me) return;
      setCurrentUserId(me.id);

      // 1) get timelines authored by me
      const { data: timelines } = await supabase
        .from("timelines")
        .select("id")
        .eq("author", me.id);

      const timelineIds = (timelines || []).map((t: any) => t.id);
      if (timelineIds.length === 0) {
        setLikers([]);
        return;
      }

      // 2) get likes for those timelines
      const { data: likes } = await supabase
        .from("likes")
        .select("user_id")
        .in("timeline_id", timelineIds);

      let userIds = Array.from(
        new Set((likes || []).map((l: any) => l.user_id)),
      );
      // exclude current user from likers list
      userIds = userIds.filter((id: string) => id !== me.id);
      if (userIds.length === 0) {
        setLikers([]);
        return;
      }

      // 3) fetch users info
      const { data: users } = await supabase
        .from("users")
        .select("id, name, icon_url")
        .in("id", userIds);

      setLikers((users as UserRow[]) || []);
    } catch (e) {
      console.error("Failed to load likers", e);
    } finally {
      setLoading(false);
    }
  };

  // リフレッシュ時の処理
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchLikers();
    setIsRefreshing(false);
  };

  // subscribe to realtime messages (global) and filter in client
  useEffect(() => {
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newRow = payload.new as MessageRow;
          // if chat open and message belongs to conversation, append
          if (
            chatOpen &&
            currentUserId &&
            otherUser &&
            ((newRow.author === currentUserId &&
              newRow.to_user === otherUser.id) ||
              (newRow.author === otherUser.id &&
                newRow.to_user === currentUserId))
          ) {
            // index2.tsx の実装に合わせ、新着メッセージを配列先頭に追加（inverted FlatList に対応）
            setMessages((prev) => [newRow, ...prev]);
          }
        },
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      try {
        channel.unsubscribe();
      } catch (_) {}
    };
  }, [chatOpen, currentUserId, otherUser]);
  const openChat = async (user: UserRow) => {
    setOtherUser(user);
    setChatOpen(true);
    setMessages([]);
    if (!currentUserId) return;
    try {
      const orFilter = `and(author.eq.${currentUserId},to_user.eq.${user.id}),and(author.eq.${user.id},to_user.eq.${currentUserId})`;
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(orFilter)
        // index2.tsx の実装に合わせ、新しい順で取得（inverted FlatList に対応）
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data as MessageRow[]) || [];
      setMessages(rows);
      // inverted FlatList を使うため手動スクロールは不要
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };
  const closeChat = () => {
    setChatOpen(false);
    setOtherUser(null);
    setMessages([]);
    setNewMessage("");
  };
  const sendMessage = async () => {
    if (!currentUserId || !otherUser || newMessage.trim() === "") return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        author: currentUserId,
        to_user: otherUser.id,
        content: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage("");
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const containerStyle = [
    styles.container,
    { paddingTop: 16 + insets.top, paddingBottom: 16 + insets.bottom },
  ];
  const chatContainerStyle = [
    styles.chatContainer,
    { paddingTop: 12 + insets.top },
  ];
  const composerStyle = [
    styles.composer,
    { paddingBottom: 25 + insets.bottom },
  ];

  return (
    <ThemedView style={containerStyle}>
      <ThemedText type="title" style={styles.title}>
        投稿にいいねしてくれた人
      </ThemedText>

      <ThemedText style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
        自分のアイデアや趣味に興味を持ってくれた人たちと話をしてみましょう！
      </ThemedText>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={likers}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
              <View style={styles.rowLeft}>
                {item.icon_url ? (
                  <Image
                    source={{ uri: item.icon_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
                <ThemedText style={styles.name}>{item.name}</ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
              まだいいねがありません。
            </ThemedText>
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Modal visible={chatOpen} animationType="slide">
        {/* KeyboardAvoidingView を使い、キーボード表示時に入力欄が隠れないようにする */}
        <KeyboardAvoidingView
          style={chatContainerStyle}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.chatHeader}>
            <Pressable onPress={closeChat}>
              <ThemedText>閉じる</ThemedText>
            </Pressable>
            <ThemedText type="title">{otherUser?.name}</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          <FlatList
            ref={(r) => {
              listRef.current = r;
            }}
            data={messages}
            keyExtractor={(m) => m.id}
            // 最新メッセージを下に表示するためリストを反転
            inverted={true}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View
                style={
                  item.author === currentUserId
                    ? styles.messageRowRight
                    : styles.messageRowLeft
                }
              >
                <ThemedText
                  style={{
                    color: item.author === currentUserId ? "#fff" : "#000",
                  }}
                >
                  {item.content}
                </ThemedText>
              </View>
            )}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 20 + insets.bottom,
            }}
          />
          <View style={composerStyle}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="メッセージを入力"
              style={styles.input}
            />
            <Pressable
              onPress={sendMessage}
              style={styles.sendButton}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={{ color: "#fff" }}>
                  <MaterialIcons name="chevron-right" size={24} color="#fff" />
                </ThemedText>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  name: { fontSize: 16 },
  chatContainer: { flex: 1, paddingTop: 40 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  messageRowLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  messageRowRight: {
    alignSelf: "flex-end",
    backgroundColor: "#4f93ff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  composer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
