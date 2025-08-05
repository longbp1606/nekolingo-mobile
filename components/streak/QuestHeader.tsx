import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface QuestHeaderProps {
  title: string;
  subtitle: string;
  timeRemaining: string;
  characterAvatar?: string;
}

export function QuestHeader({
  title,
  subtitle,
  timeRemaining,
  characterAvatar,
}: QuestHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.monthLabel}>THÁNG TÁM</Text>
          <Text style={styles.title}>{String(title || "")}</Text>
          <Text style={styles.subtitle}>{String(subtitle || "")}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>
              <FontAwesome name="clock-o" size={18} color="#FFF" />
            </Text>
            <Text style={styles.timeText}>{String(timeRemaining || "")}</Text>
          </View>
        </View>

        {characterAvatar && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image
                source={require(`../../assets/images/summer.gif`)}
                style={styles.avatarEmoji}
              />
            </View>
          </View>
        )}
      </View>
      {/* <QuestMission
        title="Kiếm 30 Điểm nhiệm vụ"
        subtitle=""
        progress={15}
        total={30}
        icon="🔒"
        style={{
          paddingRight: 20, paddingLeft: 20, marginLeft: 0, marginRight: 0,
        }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#2B70C9",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  avatarEmoji: {
    width: 100,
    height: 100,
  },
  monthLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  avatarContainer: {
    marginLeft: 20,
  },
  avatar: {
    width: 110,
    height: 120,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
