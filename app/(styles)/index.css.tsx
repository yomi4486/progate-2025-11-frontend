import { StyleSheet } from "react-native";

export const cardStyles = StyleSheet.create({
  card: {
    width: 320,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  image: { height: 180, borderRadius: 8, marginBottom: 8 },
});

export const swipeStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  cardWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
