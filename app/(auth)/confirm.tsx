import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
  // Send a magic link as a way to prompt email delivery (used here for re-sending a confirmation)
  const { error } = await supabase.auth.signInWithOtp({ email: String(email) });
  if (error) throw error;
  Alert.alert('メール送信済み', `${email} 宛に確認メール（マジックリンク）を送信しました。メールの確認を行ってください。`);
    } catch (err: any) {
      Alert.alert('エラー', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">メール確認が必要です</ThemedText>
      <Text style={styles.text}>{email ? `${email} 宛にメールを送信しました。メールアドレスの確認をしてください。` : '指定されたメールアドレスを確認できませんでした。'}</Text>
      <View style={{ height: 12 }} />
      <Button title={loading ? '送信中...' : '確認メールを再送する'} onPress={handleResend} disabled={loading || !email} />
      <View style={{ height: 12 }} />
      <Button title="ログインに戻る" onPress={() => router.replace('/login' as any)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'stretch', justifyContent: 'center' },
  text: { marginTop: 12, marginBottom: 12, color: '#666' },
});
