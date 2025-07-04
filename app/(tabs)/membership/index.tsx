import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Sizes } from "../../../constants";

export default function MembershipScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Membership</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Sizes.h1,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.h4,
    color: Colors.textLight,
  },
});
