import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import { useGetProfileQuery } from "../../../services/auth/authApiService";
import {
  useGetOverallLeaderboardQuery,
  useGetWeeklyLeaderboardQuery,
} from "../../../services/leaderboardApiService";

const { width: screenWidth } = Dimensions.get("window");

const LeaderboardScreen = () => {
  const [selectedTab, setSelectedTab] = useState<"overall" | "weekly">(
    "overall"
  );

  const { user, isAuthenticated, isLoading } = useAuth();

  // RTK Query hooks
  const {
    data: overallLeaderboard,
    isLoading: loadingOverall,
    error: overallError,
    refetch: refetchOverall,
  } = useGetOverallLeaderboardQuery();

  const {
    data: weeklyLeaderboard,
    isLoading: loadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useGetWeeklyLeaderboardQuery();

  const { data: profileData, isLoading: loadingProfile } = useGetProfileQuery();

  const [refreshing, setRefreshing] = useState(false);

  // Helper function to transform leaderboard data
  const transformLeaderboardData = (
    data: any[] | undefined,
    isWeekly = false
  ) => {
    if (!data) return [];

    const sortedData = isWeekly
      ? [...data].sort(
          (a, b) => (b.user_id?.weekly_xp || 0) - (a.user_id?.weekly_xp || 0)
        )
      : [...data].sort((a, b) => (b.xp || 0) - (a.xp || 0));

    return sortedData.map((item, index) => {
      const userData = isWeekly ? item.user_id : item;
      const xp = isWeekly ? userData?.weekly_xp || 0 : userData?.xp || 0;

      return {
        _id: userData?._id || item._id,
        rank: index + 1,
        name: userData?.username || `User ${index + 1}`,
        email: userData?.email || "",
        xp: xp,
        avatar: userData?.username?.charAt(0)?.toUpperCase() || "?",
        color: getRandomUserColor(),
        isOnline: true, // You can adjust this based on your data
        level: Math.floor(xp / 100) + 1, // Simple level calculation
        streak: 0, // You can adjust this based on your data
        hearts: 5, // Default hearts
      };
    });
  };

  // Helper function for random colors
  const getRandomUserColor = () => {
    const colors = [
      "#ff9500",
      "#ff69b4",
      "#ff4444",
      "#4CAF50",
      "#9966ff",
      "#00BFFF",
      "#FFD700",
      "#FF6347",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get current data based on selected tab
  const currentData =
    selectedTab === "overall"
      ? transformLeaderboardData(overallLeaderboard, false)
      : transformLeaderboardData(weeklyLeaderboard, true);

  const loading =
    loadingOverall || loadingWeekly || isLoading || loadingProfile;
  const error = overallError || weeklyError;

  // Get current user from profile
  const currentUser = profileData?.data;

  useFocusEffect(
    useCallback(() => {
      refetchOverall();
      refetchWeekly();
    }, [refetchOverall, refetchWeekly])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOverall(), refetchWeekly()]);
    setRefreshing(false);
  };

  const handleTabChange = (tab: "overall" | "weekly") => {
    setSelectedTab(tab);
  };

  const theme = {
    color: {
      white: "#FFFFFF",
      title: "#4B4B4B",
      primary: "#00C2D1",
      darkPrimary: "#009EB2",
      description: "#777",
      red: "#FF4B4B",
      bgRed: "#FFDFE0",
      green: "#58CC02",
      bgGreen: "#D7FFB8",
      bgBlue: "#CCF2F5",
      darkGreen: "#4DAA02",
      darkRed: "#E04343",
      lightOrange: "#FFD700",
      orange: "#FFA500",
      lightPurple: "#AB47BC",
      darkPurple: "#9C27B0",
    },
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#ffd900ff";
      case 2:
        return "#c0c0c0";
      case 3:
        return "#f6a04aff";
      default:
        return theme.color.green;
    }
  };

  const formatScore = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M XP`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K XP`;
    }
    return `${xp} XP`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.color.primary} />
        <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Chưa đăng nhập</Text>
        <Text style={styles.errorMessage}>
          Vui lòng đăng nhập để xem bảng xếp hạng
        </Text>
      </View>
    );
  }

  if (error && currentData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra</Text>
        <Text style={styles.errorMessage}>
          {error && "data" in error
            ? String(error.data)
            : "Có lỗi xảy ra khi tải bảng xếp hạng"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.color.primary]}
            tintColor={theme.color.primary}
          />
        }
      >
        <View style={styles.fixedHeader}>
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[
                styles.tabOption,
                selectedTab === "overall" && styles.tabOptionActive,
              ]}
              onPress={() => handleTabChange("overall")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "overall" && styles.tabTextActive,
                ]}
              >
                🏆 Tổng sắp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabOption,
                selectedTab === "weekly" && styles.tabOptionActive,
              ]}
              onPress={() => handleTabChange("weekly")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "weekly" && styles.tabTextActive,
                ]}
              >
                📅 Tuần này
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>
              {selectedTab === "overall"
                ? "Bảng xếp hạng tổng"
                : "Bảng xếp hạng tuần"}
            </Text>
            <Text style={styles.tabSubtitle}>
              {selectedTab === "overall"
                ? "Xếp hạng dựa trên tổng XP tích lũy"
                : "Xếp hạng dựa trên XP tuần này"}
            </Text>
          </View>
        </View>

        {/* Leaderboard Container */}
        <View style={styles.leaderboardContainer}>
          {currentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có người chơi trong giải đấu này
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {currentData.map((player: any, index: number) => (
                <View
                  key={player._id}
                  style={[
                    styles.leaderboardItem,
                    currentUser?.id === player._id && styles.currentUserItem,
                  ]}
                >
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: getRankColor(player.rank) },
                    ]}
                  >
                    <Text style={styles.rankText}>{player.rank}</Text>
                  </View>

                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: player.color },
                      ]}
                    >
                      <Text style={styles.avatarText}>{player.avatar}</Text>
                    </View>
                    {player.isOnline && <View style={styles.onlineIndicator} />}
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {player.name}
                      {currentUser?.id === player._id && " (Bạn)"}
                    </Text>
                    <View style={styles.userStats}>
                      <Text style={styles.userLevel}>Level {player.level}</Text>
                      <Text style={styles.userStreak}>🔥 {player.streak}</Text>
                    </View>
                  </View>

                  <Text style={styles.userScore}>{formatScore(player.xp)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  fixedHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: "100%",
  },
  tournamentSelector: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  tournamentOption: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tournamentOptionActive: {
    width: 80,
    height: 80,
    opacity: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tournamentIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  tournamentIconActive: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  tournamentContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 4,
  },
  tournamentSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  leaderboardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  leaderboardList: {
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
  },
  userScore: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4B4B",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#00C2D1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  currentUserItem: {
    backgroundColor: "#CCF2F5",
    borderWidth: 2,
    borderColor: "#00C2D1",
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  userLevel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },
  userStreak: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
  },

  // New tab styles
  tabSelector: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
  },
  tabOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOptionActive: {
    backgroundColor: "#00C2D1",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4B4B4B",
    textAlign: "center",
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default LeaderboardScreen;
