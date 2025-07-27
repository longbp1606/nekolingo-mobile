import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  onListPress: () => void;
  userLevel?: number;
  userName?: string;
}

export const HomeHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  backgroundColor,
  onListPress,
  userLevel,
  userName,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
        {userLevel && <Text style={styles.userLevel}>Level {userLevel}</Text>}
      </View>
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
  headerContent: {
    flex: 1,
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
  userLevel: {
    color: "white",
    fontSize: 14,
    marginTop: 2,
    opacity: 0.8,
    fontWeight: "600",
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
