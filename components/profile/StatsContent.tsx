import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { User } from "../../services/auth/authApiService";

interface StatItem {
  icon: any;
  label: string;
  value: string;
  className: string;
}

interface StatsContentProps {
  user: User;
}

const getLeague = (xp: number): string => {
  if (xp < 500) return "Đồng";
  if (xp < 1999) return "Bạc";
  if (xp < 9999) return "Vàng";
  return "Kim Cương";
};

const getStatsFromUser = (userData: User): StatItem[] => {
  const streak =
    (userData as any).streak_days ||
    userData.streakDays ||
    userData.current_streak ||
    0;
  const totalXp = userData.xp || userData.total_xp || 0;
  const currentLevel =
    (userData as any).current_level ||
    userData.currentLevel ||
    userData.level ||
    1;
  const freezeCount =
    (userData as any).freeze_count !== undefined
      ? (userData as any).freeze_count
      : userData.freezeCount || 0;
  const isFreeze =
    (userData as any).is_freeze !== undefined
      ? (userData as any).is_freeze
      : userData.isFreeze || false;

  return [
    {
      icon: require("../../assets/images/flame.png"),
      label: "Ngày streak",
      value: streak.toString(),
      className: "streak",
    },
    {
      icon: require("../../assets/images/lightning.png"),
      label: "Tổng điểm XP",
      value: totalXp.toString(),
      className: "lightning",
    },
    {
      icon: require("../../assets/images/winner.png"),
      label: "Giải đấu hiện tại",
      value: getLeague(totalXp),
      className: "bronze",
    },
    {
      icon: require("../../assets/images/trophy.png"),
      label: "Cấp độ hiện tại",
      value: currentLevel.toString(),
      className: "trophy",
    },
    {
      icon: require("../../assets/images/star.png"),
      label: "Freeze bảo vệ",
      value: freezeCount === -1 ? "∞" : freezeCount.toString(),
      className: "freeze",
    },
    {
      icon: require("../../assets/images/star-3d.png"),
      label: "Trạng thái freeze",
      value: isFreeze ? "Đang bảo vệ" : "Không hoạt động",
      className: isFreeze ? "freeze-active" : "freeze-inactive",
    },
  ];
};

const StatsContent: React.FC<StatsContentProps> = ({ user }) => {
  const stats = getStatsFromUser(user);
  const freezeCount =
    (user as any).freeze_count !== undefined
      ? (user as any).freeze_count
      : user.freezeCount || 0;
  const isFreeze =
    (user as any).is_freeze !== undefined
      ? (user as any).is_freeze
      : user.isFreeze || false;

  return (
    <>
      {/* Gem Balance Section */}
      <View style={styles.gemBalance}>
        <Text style={styles.gemBalanceLabel}>Số dư Gem hiện tại</Text>
        <Text style={styles.gemAmount}>{user?.balance || 0} 💎</Text>
      </View>

      {/* Freeze Status Info */}
      {(freezeCount > 0 || isFreeze) && (
        <View style={styles.freezeStatusCard}>
          <Text style={styles.freezeStatusTitle}>
            🛡️ Trạng thái Freeze Protection
          </Text>
          <Text style={styles.freezeStatusText}>
            {isFreeze
              ? "🟢 Streak của bạn đang được bảo vệ!"
              : freezeCount > 0
              ? `⚡ Bạn có ${freezeCount} lần freeze bảo vệ`
              : "❌ Không có freeze bảo vệ"}
          </Text>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat: StatItem, index: number) => (
          <View key={index} style={styles.statCard}>
            <Image source={stat.icon} style={styles.statImg} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gemBalance: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
  },
  gemBalanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  gemAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  freezeStatusCard: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#00C2D1",
  },

  freezeStatusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },

  freezeStatusText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "32%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  statImg: {
    width: 38,
    height: 38,
    marginTop: 5,
    marginBottom: 5,
    resizeMode: "contain",
  },

  statInfo: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B4B4B",
    lineHeight: 24,
    textAlign: "center",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    lineHeight: 14,
    textAlign: "center",
  },
});

export default StatsContent;
