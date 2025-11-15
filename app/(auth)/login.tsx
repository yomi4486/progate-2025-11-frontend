import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Try sign in with email+password. If user not found, create account then sign in.
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("入力エラー", "メールとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      // Try sign in
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInRes.error) {
        // If user does not exist, create user then sign in
        if (signInRes.error.status === 400 || signInRes.error.status === 401) {
          // Attempt signup
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({ email, password });
          if (signUpError) throw signUpError;

          // After signUp, sign in
          const { error: secondSignInError } =
            await supabase.auth.signInWithPassword({ email, password });
          if (secondSignInError) throw secondSignInError;
        } else {
          throw signInRes.error;
        }
      }

      // On success, navigate to app
      router.replace("/(tabs)");
    } catch (error: any) {
      // If email not confirmed, navigate to confirmation screen
      const message: string = (error && error.message) || String(error);
      if (
        message.toLowerCase().includes("email not confirmed") ||
        message.toLowerCase().includes("confirm") ||
        error?.status === 403
      ) {
        router.push({ pathname: "/confirm", params: { email } });
        return;
      }

      Alert.alert("サインインに失敗しました", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">ログイン</ThemedText>
      <Text style={styles.help}>メールでログインしましょう</Text>
      <TextInput
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading ? "処理中..." : "サインイン / サインアップ"}
        onPress={handleSignIn}
        disabled={loading || !email || !password}
      />
      <View style={{ height: 12 }} />
      <Button title="サインアウト(デバッグ)" onPress={handleSignOut} />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 12,
    borderRadius: 6,
  },
  help: { marginTop: 8, marginBottom: 8, color: "#666" },
});
