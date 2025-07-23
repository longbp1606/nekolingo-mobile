import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  onListPress: () => void;
}

export const HomeHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  backgroundColor,
  onListPress,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.bookmarkButton} onPress={onListPress}>
        <Ionicons name="list" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    position: "relative",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "white",
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  bookmarkButton: {
    position: "absolute",
    right: 20,
    top: 25,
    padding: 10,
    borderRadius: 12,
    borderColor: "#fff",
    borderWidth: 1,
  },
});
