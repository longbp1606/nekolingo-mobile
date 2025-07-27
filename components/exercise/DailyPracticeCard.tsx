import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface DailyPracticeCardProps {
  title: string;
  subtitle: string;
  character?: string;
  onUnlock?: () => void;
}

export function DailyPracticeCard({
  title,
  subtitle,
  character,
  onUnlock,
}: DailyPracticeCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ôn tập hàng ngày</Text>

      <View style={styles.cardContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>SUPER</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* <TouchableOpacity style={styles.unlockButton} onPress={onUnlock}>
            <Text style={styles.unlockButtonText}>MỞ KHOÁ</Text>
          </TouchableOpacity> */}
        </View>

        {character && (
          <View style={styles.characterContainer}>
            <View style={styles.characterCircle}>
              <Image source={require("./../../assets/images/practice.png")} style={styles.characterEmoji} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  unlockButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  unlockButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
  },
  characterContainer: {
    marginLeft: 20,
  },
  characterCircle: {
    width: 130,
    height: 120,
    borderRadius: 17.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  characterEmoji: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});
