import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FriendQuestCard,
  MissionSection,
  QuestHeader,
  QuestMission,
} from "../../../components/streak";
import { useQuests } from "../../../hooks/useQuests";
import { QuestReward } from "../../../types/quest";

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
      console.error('Error refreshing quests:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMissionPress = async (questId: string) => {
    console.log("Mission pressed:", questId);

    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    if (quest.isCompleted) {
      try {
        const reward = await claimReward(questId);
        if (reward) {
          showRewardAlert(reward);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể nhận thưởng');
      }
    } else {
      Alert.alert(
        quest.title,
        `Tiến độ: ${quest.progress}/${quest.total}\n${quest.subtitle}`,
        [{ text: 'OK' }]
      );
    }
  };

  const showRewardAlert = (reward: QuestReward) => {
    const rewardText = reward.type === 'xp' ? `${reward.amount} XP` :
      reward.type === 'gem' ? `${reward.amount} Gem` :
        `${reward.amount} Tim`;

    Alert.alert(
      'Chúc mừng! 🎉',
      `Bạn đã nhận được ${rewardText}!`,
      [{ text: 'Tuyệt vời!' }]
    );
  };

  const handleFindFriends = () => {
    console.log("Find friends pressed");
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    return `CÒN ${hours} TIẾNG`;
  };

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
          <MissionSection title="Nhiệm vụ bạn bè" timeRemaining="4 NGÀY">
            <FriendQuestCard
              title="Theo dõi người bạn đầu tiên"
              subtitle=""
              progress={1}
              total={1}
              onFindFriends={handleFindFriends}
            />
          </MissionSection>

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
                quests.map((quest, index) => (
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
                ))
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