import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MissionSection,
  QuestHeader,
  QuestMission
} from "../../../components/streak";
import { useQuests } from "../../../hooks/useQuests";
import { QuestReward } from "../../../types/quest";
import { QuestUtils } from "../../../utils/questUtils";

export default function StreakScreen() {

  const {
    quests,
    loading,
    error,
    refreshQuests,
    updateQuestProgress,
    completeQuest,
    claimReward
  } = useQuests();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshQuests();
    } catch (err) {
      console.error('[StreakScreen] Error refreshing quests:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMissionPress = async (questId: string) => {

    const quest = quests.find(q => q.id === questId);
    if (!quest) {
      console.warn('[StreakScreen] Quest not found:', questId);
      return;
    }


    if (quest.isCompleted) {
      try {
        const reward = await claimReward(questId);
        if (reward) {
          showRewardAlert(reward);
        } else {
          console.warn('[StreakScreen] No reward received');
          Alert.alert('Thông báo', 'Không thể nhận thưởng lúc này');
        }
      } catch (error) {
        console.error('[StreakScreen] Error claiming reward:', error);
        Alert.alert('Lỗi', 'Không thể nhận thưởng');
      }
    } else if (QuestUtils.canCompleteQuest(quest.progress, quest.total)) {
      try {
        const reward = await completeQuest(questId);
        if (reward) {
          showRewardAlert(reward);
        }
      } catch (error) {
        console.error('[StreakScreen] Error completing quest:', error);
        Alert.alert('Lỗi', 'Không thể hoàn thành nhiệm vụ');
      }
    } else {
      const statusText = QuestUtils.getCompletionStatusText(quest.progress, quest.total, quest.isCompleted);
      Alert.alert(
        quest.title,
        `Tiến độ: ${statusText}\n${quest.subtitle}`,
        [{ text: 'OK' }]
      );
    }
  };

  const showRewardAlert = (reward: QuestReward) => {
    const rewardText = QuestUtils.formatRewardText(reward);
    const rewardIcon = QuestUtils.getRewardIcon(reward.type);

    Alert.alert(
      `Chúc mừng! ${rewardIcon}`,
      `Bạn đã nhận được ${rewardText}!`,
      [{ text: 'Tuyệt vời!' }]
    );
  };

  const handleFindFriends = () => {
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    const timeText = QuestUtils.formatTimeRemaining(hours);
    return timeText;
  };

  const sortedQuests = QuestUtils.sortQuestsByPriority([...quests]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <QuestHeader
          title="Mùa hè rực lửa của Eddy"
          subtitle=""
          timeRemaining="22 NGÀY"
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
              {loading && quests.length === 0 ? (
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

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>
                    Không thể tải nhiệm vụ
                  </Text>
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
    borderColor: '#e5e5e5',
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: 'stretch',
  },
  missionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
  },
  separator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e5e5e5',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});