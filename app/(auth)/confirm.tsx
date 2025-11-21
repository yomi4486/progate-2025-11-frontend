import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      // Send a magic link as a way to prompt email delivery (used here for re-sending a confirmation)
      const { error } = await supabase.auth.signInWithOtp({
        email: String(email),
      });
      if (error) throw error;
      Alert.alert(
        "メール送信済み",
        `${email} 宛に確認メール（マジックリンク）を送信しました。メールの確認を行ってください。`,
      );
    } catch (err: AuthError | unknown) {
      if (err instanceof Error)
        Alert.alert("エラー", err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const [code, setCode] = useState("");

  const handleVerifyCode = async () => {
    if (!email) return;
    if (!code) {
      Alert.alert("コードを入力してください");
      return;
    }
    setLoading(true);
    try {
      // Verify the code (OTP) sent to the user's email
      const { error } = await supabase.auth.verifyOtp({
        email: String(email),
        token: code,
        type: "signup",
      });
      if (error) throw error;
      Alert.alert("確認済み", "メールアドレスの確認が完了しました。");
      router.replace("/login");
    } catch (err: AuthError | unknown) {
      if (err instanceof Error)
        Alert.alert("エラー", err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">メール確認が必要です</ThemedText>
      <Text style={styles.text}>
        {email
          ? `${email} 宛にメールを送信しました。メールアドレスの確認をしてください。`
          : "指定されたメールアドレスを確認できませんでした。"}
      </Text>
      <View style={{ height: 12 }} />
      <TextInput
        placeholder="メールに届いたコードを入力"
        value={code}
        onChangeText={setCode}
        style={styles.codeInput}
        keyboardType="number-pad"
      />
      <View style={{ height: 12 }} />
      <Button
        title={loading ? "確認中..." : "コードで確認する"}
        onPress={handleVerifyCode}
        disabled={loading || !email}
      />
      <View style={{ height: 12 }} />
      <Button
        title={loading ? "送信中..." : "確認メール（マジックリンク）を再送する"}
        onPress={handleResend}
        disabled={loading || !email}
      />
      <View style={{ height: 12 }} />
      <Button title="ログインに戻る" onPress={() => router.replace("/login")} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "stretch",
    justifyContent: "center",
  },
  text: { marginTop: 12, marginBottom: 12, color: "#666" },
  codeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
});
