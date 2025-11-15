import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function FAB({
  onPress,
  size = 56,
}: {
  onPress: () => void;
  size?: number;
}) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Position the FAB just above the safe-area inset (tab bar typically sits at/above the inset).
  // Avoid adding a full tab-bar height here, which pushes the FAB too far upwards.
  const bottomOffset = insets.bottom + 12;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: bottomOffset }]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Colors[colorScheme ?? "light"].tint,
          },
          pressed && styles.buttonPressed,
        ]}
      >
        <MaterialIcons name="add" size={Math.round(size * 0.5)} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 34,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
