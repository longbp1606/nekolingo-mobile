import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MissionSection,
  QuestHeader,
  QuestMission,
} from "../../../components/streak";
import { useQuests } from "../../../hooks/useQuests";
import { QuestUtils } from "../../../utils/questUtils";

export default function StreakScreen() {
  const {
    quests,
    loading,
    error,
    refreshQuests,
    updateQuestProgress,
    completeQuest,
    claimReward,
    // New quest initialization features
    isInitializing,
    questsCreated,
    initializationError,
  } = useQuests({
    autoInitialize: true,
    onQuestsCreated: (createdQuests) => {
      console.log(
        `🎯 StreakScreen: ${createdQuests.length} daily quests were created!`
      );
      // You could show a notification here if desired
    },
    onInitializationError: (error) => {
      console.warn("⚠️ StreakScreen: Quest initialization failed:", error);
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshQuests();
    } catch (err) {
      console.error("[StreakScreen] Error refreshing quests:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMissionPress = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) {
      console.warn("[StreakScreen] Quest not found:", questId);
      return;
    }

    if (quest.isCompleted) {
      // Quest is completed, show reward information
      showRewardAlert(quest.reward);
    } else if (quest.progress >= quest.total) {
      // Quest progress is complete but not marked as completed yet
      // Backend will handle completion automatically, just refresh
      try {
        await refreshQuests();
        const updatedQuest = quests.find((q) => q.id === questId);
        if (updatedQuest?.isCompleted) {
          showRewardAlert(updatedQuest.reward);
        } else {
          Alert.alert(
            "Thông báo",
            "Nhiệm vụ đã hoàn thành! Thưởng sẽ được tự động cập nhật."
          );
        }
      } catch (error) {
        console.error("[StreakScreen] Error refreshing quest:", error);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái nhiệm vụ");
      }
    } else {
      // Quest is not completed yet, show progress
      const statusText = QuestUtils.getCompletionStatusText
        ? QuestUtils.getCompletionStatusText(
            quest.progress,
            quest.total,
            quest.isCompleted
          )
        : `${quest.progress}/${quest.total}`;
      Alert.alert(quest.title, `Tiến độ: ${statusText}\n${quest.subtitle}`, [
        { text: "OK" },
      ]);
    }
  };

  const showRewardAlert = (reward: any) => {
    // Handle both old and new reward formats
    const rewardText = reward
      ? QuestUtils.formatRewardText
        ? QuestUtils.formatRewardText(reward)
        : `${reward.amount} ${reward.type}`
      : "Unknown reward";
    const rewardIcon = reward
      ? QuestUtils.getRewardIcon
        ? QuestUtils.getRewardIcon(reward.type)
        : "🎁"
      : "🎁";

    Alert.alert(`Chúc mừng! ${rewardIcon}`, `Bạn đã nhận được ${rewardText}!`, [
      { text: "Tuyệt vời!" },
    ]);
  };

  const handleFindFriends = () => {};

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    const timeText = QuestUtils.formatTimeRemaining
      ? QuestUtils.formatTimeRemaining(hours)
      : `${hours}h`;
    return timeText;
  };

  // Handle quest sorting safely with type conversion
  const sortedQuests = QuestUtils.sortQuestsByPriority
    ? QuestUtils.sortQuestsByPriority([...quests] as any) // Type assertion to handle interface differences
    : [...quests];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <QuestHeader
          title="Mùa hè rực lửa"
          subtitle=""
          timeRemaining=""
          characterAvatar="eddy"
        />

        <View style={styles.content}>
          {/* <MissionSection title="Nhiệm vụ bạn bè" timeRemaining="4 NGÀY">
            <FriendQuestCard
              title="Theo dõi người bạn đầu tiên"
              subtitle=""
              progress={0}
              total={1}
              onFindFriends={handleFindFriends}
            />
          </MissionSection> */}

          <MissionSection
            title="Nhiệm vụ hằng ngày"
            timeRemaining={getTimeRemaining()}
          >
            <View style={styles.missionListWrapper}>
              {/* Quest initialization feedback */}
              {isInitializing && quests.length === 0 && (
                <View style={styles.initializingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.initializingText}>
                    Đang thiết lập nhiệm vụ hằng ngày...
                  </Text>
                </View>
              )}

              {questsCreated && (
                <View style={styles.questCreatedBanner}>
                  <Text style={styles.questCreatedIcon}>🎯</Text>
                  <Text style={styles.questCreatedText}>
                    Nhiệm vụ hằng ngày đã được tạo mới!
                  </Text>
                </View>
              )}

              {initializationError && (
                <View style={styles.initErrorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.initErrorText}>
                    Không thể khởi tạo nhiệm vụ
                  </Text>
                  <Text style={styles.initErrorSubtext}>
                    Ứng dụng vẫn hoạt động bình thường
                  </Text>
                </View>
              )}

              {loading && quests.length === 0 && !isInitializing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
                </View>
              ) : (
                sortedQuests.map((quest, index) => {
                  return (
                    <View key={quest.id} style={styles.missionItem}>
                      {index > 0 && <View style={styles.separator} />}
                      <QuestMission
                        title={quest.title}
                        subtitle={quest.subtitle}
                        progress={quest.progress}
                        total={quest.total}
                        icon={quest.icon}
                        onPress={() => handleMissionPress(quest.id)}
                        style={{ padding: 0 }}
                        isCompleted={quest.isCompleted}
                      />
                    </View>
                  );
                })
              )}

              {error && !initializationError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>Không thể tải nhiệm vụ</Text>
                  <Text style={styles.errorSubtext}>
                    Vui lòng kéo xuống để thử lại
                  </Text>
                </View>
              )}
            </View>
          </MissionSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    paddingVertical: 20,
  },
  missionListWrapper: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "stretch",
  },
  missionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
  },
  separator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#e5e5e5",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  // Quest initialization styles
  initializingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
  },
  initializingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
    fontWeight: "500",
  },
  questCreatedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#E8F5E8",
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
    marginBottom: 8,
  },
  questCreatedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  questCreatedText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  initErrorContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
  },
  initErrorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
    textAlign: "center",
    marginBottom: 4,
  },
  initErrorSubtext: {
    fontSize: 12,
    color: "#FF8F00",
    textAlign: "center",
  },
});
