import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import LeaderboardService from "../../../services/leaderboardService";

const { width: screenWidth } = Dimensions.get("window");

interface DetailedUser {
  rank: number;
  _id: string;
  name: string;
  email: string;
  score: string;
  xp: number;
  avatar: string;
  color: string;
  isOnline: boolean;
  level: number;
  streak: number;
  hearts: number;
}

interface TournamentLeaderboards {
  bronze: DetailedUser[];
  silver: DetailedUser[];
  gold: DetailedUser[];
  diamond: DetailedUser[];
}

const LeaderboardScreen = () => {
  const [selectedTournament, setSelectedTournament] = useState<
    "bronze" | "silver" | "gold" | "diamond"
  >("bronze");
  const [leaderboardData, setLeaderboardData] =
    useState<TournamentLeaderboards | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading } = useAuth();

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

  const tournaments = {
    bronze: {
      icon: require("../../../assets/images/bronze-medal.png"),
      title: "Giải đấu Đồng",
      subtitle: "Dưới 500 XP - Top 15 sẽ được thăng hạng",
      gradient: "linear-gradient(135deg, #CD7F32, #F4E4BC)",
      backgroundColor: "#64380dff",
    },
    silver: {
      icon: require("../../../assets/images/silver-medal.png"),
      title: "Giải đấu Bạc",
      subtitle: "500 - 1999 XP - Top 10 sẽ được thăng hạng",
      gradient: "linear-gradient(135deg, #C0C0C0, #E8E8E8)",
      backgroundColor: "#d4d4d4ff",
    },
    gold: {
      icon: require("../../../assets/images/gold-medal.png"),
      title: "Giải đấu Vàng",
      subtitle: "2000 - 9999 XP - Top 5 sẽ được thăng hạng",
      gradient: "linear-gradient(135deg, #FFD700, #FFF8DC)",
      backgroundColor: "#faea90ff",
    },
    diamond: {
      icon: require("../../../assets/images/diamond.png"),
      title: "Giải đấu Kim Cương",
      subtitle: "Trên 10000 XP - Giải đấu cao nhất",
      gradient: "linear-gradient(135deg, #00BFFF, #E0F6FF)",
      backgroundColor: "#caeefaff",
    },
  };

  const loadLeaderboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const data = await LeaderboardService.getTournamentLeaderboards();
      setLeaderboardData(data);

      if (user && (user.id || user._id)) {
        const userId = user.id || user._id;
        if (userId) {
          const userRank = await LeaderboardService.getCurrentUserRank(userId);
          if (userRank) {
            setSelectedTournament(userRank.tournament as any);
          }
        }
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải bảng xếp hạng"
      );
      Alert.alert("Lỗi", "Không thể tải bảng xếp hạng. Vui lòng thử lại sau.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboardData(false);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboardData(false);
  };

  const handleTournamentChange = (
    tournamentType: "bronze" | "silver" | "gold" | "diamond"
  ) => {
    setSelectedTournament(tournamentType);
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

  if (loading || isLoading) {
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

  if (error && !leaderboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadLeaderboardData()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentTournament = tournaments[selectedTournament];
  const currentData = leaderboardData?.[selectedTournament] || [];

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
          <View style={styles.tournamentSelector}>
            {Object.entries(tournaments).map(([key, tournament]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tournamentOption,
                  selectedTournament === key && styles.tournamentOptionActive,
                  { backgroundColor: tournament.backgroundColor },
                ]}
                onPress={() => handleTournamentChange(key as any)}
              >
                <Image
                  style={[
                    styles.tournamentIcon,
                    selectedTournament === key && styles.tournamentIconActive,
                  ]}
                  source={tournament.icon}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tournamentContent}>
            <Text style={styles.tournamentTitle}>
              {currentTournament.title}
            </Text>
            <Text style={styles.tournamentSubtitle}>
              {currentTournament.subtitle}
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
              {currentData.map((player, index) => (
                <View
                  key={player._id}
                  style={[
                    styles.leaderboardItem,
                    user?.id === player._id && styles.currentUserItem,
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
                      {user?.id === player._id && " (Bạn)"}
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
});

export default LeaderboardScreen;
