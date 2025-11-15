import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FAB } from '@/components/ui/fab';
import { FloatingModal } from '@/components/ui/post-modal';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import TinderCard from 'react-tinder-card';
import { cardStyles, styles, swipeStyles } from './index.css';

type TimelineItem = Database["public"]["Tables"]["timelines"]["Row"];

function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <View style={cardStyles.card} key={item.id}>
      <ThemedText type="subtitle">{item.title ?? 'No title'}</ThemedText>
      <ThemedText>{item.description ?? ''}</ThemedText>
    </View>
  );
}

type SwipeHandlers = {
  onSwipe?: (id: string, direction: string) => void;
  onCardLeftScreen?: (id: string) => void;
};

function TimelineSwiper({ items, onSwipe, onCardLeftScreen }: { items: TimelineItem[] } & SwipeHandlers) {
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
    <View style={[swipeStyles.container, { position: 'relative', minHeight: 420 }]}> 
      {stack.map((item, idx) => {
            const zIndex = stack.length - idx;
            const offsetTop = idx * 8;

            return (
              <View
                key={item.id}
                style={[swipeStyles.cardWrapper, { zIndex, top: offsetTop }]}> 
            <TinderCard
              onSwipe={(dir: string) => onSwipe?.(item.id, dir)}
              onCardLeftScreen={() => handleCardLeftInternal(item.id)}>
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
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostBanner, setNewPostBanner] = useState<string | null>(null);

  const fetchTimelines = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('timelines')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data as unknown as TimelineItem[]) || []);
    } catch (err) {
      console.error('Failed to fetch timelines', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  useEffect(() => {
    // Subscribe to realtime inserts on timelines
    const channel = supabase.channel('public:timelines')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timelines' }, (payload) => {
        try {
          const newRow = payload.new as TimelineItem;
          // Prepend to local items so UI updates immediately
          setItems((prev) => [newRow, ...prev]);
          // Show banner message for 5 seconds
          setNewPostBanner('新しい投稿があります！');
          setTimeout(() => setNewPostBanner(null), 5000);
        } catch (e) {
          console.error('Realtime payload handling failed', e);
        }
      })
      .subscribe();

    return () => {
      try { channel.unsubscribe(); } catch (_) { /* ignore */ }
    };
  }, []);

  const handleSwipe = (id: string, direction: string) => {
    // small abstraction: future logic (save vote, analytics) goes here
    console.log('swiped', id, direction);
  };

  const handleCardLeft = (id: string) => {
    console.log('card left screen', id);
  };

  const [modalVisible, setModalVisible] = useState(false);

  const openCreate = () => setModalVisible(true);
  const closeCreate = () => setModalVisible(false);

  const handleSubmit = (title: string, description: string) => {
    console.log('posting', { title, description });
    // TODO: call supabase to insert timeline item
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {newPostBanner ? (
        <ThemedView style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 8, zIndex: 1100, alignItems: 'center' }}>
          <ThemedView style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <ThemedText style={{ color: '#fff' }}>{newPostBanner}</ThemedText>
          </ThemedView>
        </ThemedView>
      ) : null}
      <ParallaxScrollView scrollEnabled={false} headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={null}>
        <ThemedView style={[styles.titleContainer, { paddingTop: insets.top }] }>
          <ThemedText type="title">タイムライン</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.stepContainer, styles.centerFill, { paddingTop: 8 + insets.top } ]}> 
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <TimelineSwiper items={items} onSwipe={handleSwipe} onCardLeftScreen={handleCardLeft} />
          )}
        </ThemedView>
      </ParallaxScrollView>
  <FAB onPress={openCreate} />
  <FloatingModal visible={modalVisible} onClose={closeCreate} onSubmit={handleSubmit} />
    </ThemedView>
  );
}