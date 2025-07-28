import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../config/routes";
import { useAchievements } from "../hooks/useAchievement";

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
    darkGreen: "4DAA02",
    darkRed: "E04343",
    lightOrange: "FFD700",
    orange: "FFA500",
    lightPurple: "AB47BC",
    darkPurple: "9C27B0",
  },
};

interface AchievementListProps {
  userId?: string;
  userStats?: {
    xp?: number;
    completed_lessons?: number;
    completed_courses?: number;
    has_practiced?: boolean;
    streak_days?: number;
    perfect_lessons?: number;
  };
  showViewAll?: boolean;
  limit?: number;
}

const AchievementList: React.FC<AchievementListProps> = ({
  userId,
  userStats,
  showViewAll = true,
  limit,
}) => {
  const router = useRouter();

  // Only call useAchievements if we have a valid userId
  const shouldFetchAchievements = Boolean(
    userId && userId !== "null" && userId !== "undefined"
  );

  const { achievements, loading, error, refreshAchievements } = useAchievements(
    {
      userId: shouldFetchAchievements ? userId : undefined,
      userStats: shouldFetchAchievements ? userStats : undefined,
    }
  );

  const displayedAchievements = limit
    ? achievements.slice(0, limit)
    : achievements;

  // If no userId provided, don't render anything
  if (!shouldFetchAchievements) {
    return null;
  }

  const getIconWrapperStyle = (className: string) => {
    switch (className) {
      case "fire":
        return [
          styles.achievementIconWrapper,
          {
            backgroundColor: theme.color.bgRed,
            borderColor: theme.color.red,
            borderBottomColor: theme.color.red,
          },
        ];
      case "scholar":
        return [
          styles.achievementIconWrapper,
          {
            backgroundColor: theme.color.bgGreen,
            borderColor: theme.color.green,
            borderBottomColor: theme.color.green,
          },
        ];
      case "student":
        return [
          styles.achievementIconWrapper,
          {
            backgroundColor: theme.color.bgBlue,
            borderColor: theme.color.primary,
            borderBottomColor: theme.color.primary,
          },
        ];
      default:
        return styles.achievementIconWrapper;
    }
  };

  const getTextColor = (className: string) => {
    switch (className) {
      case "fire":
        return theme.color.red;
      case "scholar":
        return theme.color.green;
      case "student":
        return theme.color.primary;
      default:
        return theme.color.title;
    }
  };

  if (loading && achievements.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.color.primary} />
          <Text style={styles.loadingText}>Đang tải thành tích...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshAchievements}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (achievements.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thành tích nào</Text>
          <Text style={styles.emptySubText}>
            Hãy hoàn thành các bài học để mở khóa thành tích!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshAchievements}
          colors={[theme.color.primary]}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.achievementSection}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementTitle}>Thành tích</Text>
            {showViewAll && achievements.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(ROUTES.ALLACHIEVEMENT as any)}
              >
                <Text style={styles.viewAllLink}>XEM TẤT CẢ</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.achievementListWrapper}>
            {displayedAchievements.map((ach, index) => (
              <View key={ach.id} style={styles.achievementItem}>
                {index > 0 && <View style={styles.separator} />}

                <View style={getIconWrapperStyle(ach.className)}>
                  <Image source={ach.icon} style={styles.achievementImg} />
                  <Text
                    style={[
                      styles.achievementText,
                      { color: getTextColor(ach.className) },
                    ]}
                  >
                    {ach.level}
                  </Text>
                </View>

                <View style={styles.achievementInfo}>
                  <View style={styles.achievementLead}>
                    <Text style={styles.achievementName}>{ach.name}</Text>
                    <Text style={styles.achievementDesc}>
                      {ach.progressText}
                    </Text>
                  </View>

                  <View style={styles.achievementProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${ach.percentage}%`,
                            backgroundColor:
                              ach.percentage === 100
                                ? theme.color.green
                                : "#FFA500",
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <Text style={styles.achievementDescBottom}>{ach.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 20,
  },
  achievementSection: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 25,
    fontWeight: "700",
    margin: 0,
    color: theme.color.title,
  },
  viewAllLink: {
    fontSize: 12,
    color: theme.color.primary,
    fontWeight: "600",
  },
  achievementListWrapper: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
  },
  achievementItem: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    position: "relative",
  },
  separator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#e5e5e5",
  },
  achievementIconWrapper: {
    width: 80,
    height: 100,
    borderRadius: 8,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 5,
    padding: 8,
  },
  achievementImg: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: "600",
  },
  achievementInfo: {
    flex: 1,
    gap: 8,
  },
  achievementLead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.color.title,
    flex: 1,
  },
  achievementDesc: {
    fontSize: 14,
    color: theme.color.description,
  },
  achievementDescBottom: {
    fontSize: 14,
    color: theme.color.description,
    lineHeight: 20,
  },
  achievementProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    minWidth: 2,
  },
  unlockedText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.color.description,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: theme.color.red,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: theme.color.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.color.white,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.color.title,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: theme.color.description,
    textAlign: "center",
  },
});

export default AchievementList;
