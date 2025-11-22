import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

export default function AuthLayout() {
  useEffect(() => {
    // Disable Android hardware back button while in auth flow
    if (Platform.OS === "ios") {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        // returning true prevents default back behavior
        return true;
      });
      return () => sub.remove();
    }
    return;
  }, []);

  // Use a Stack layout for auth routes and disable header and gestures
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
  );
}
