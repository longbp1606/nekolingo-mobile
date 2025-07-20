import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MembershipHeaderProps {
  title: string;
  subtitle: string;
}

export function MembershipHeader({ title, subtitle }: MembershipHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4B4B4B",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
