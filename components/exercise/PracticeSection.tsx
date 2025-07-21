import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PracticeItemProps {
  title: string;
  iconSource: any;
  iconColor?: any;
  onPress?: () => void;
}

export function PracticeItem({
  title,
  iconSource,
  iconColor,
  onPress,
}: PracticeItemProps) {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Image source={iconSource} style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
}

interface PracticeSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export function PracticeSection({
  title,
  badge,
  children,
}: PracticeSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B4B4B",
  },
  badgeContainer: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  itemContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
