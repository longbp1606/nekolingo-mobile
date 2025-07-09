import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FriendQuestCard,
  MissionSection,
  QuestHeader,
  QuestMission,
} from "../../../components/streak";

export default function StreakScreen() {
  const handleMissionPress = (missionId: string) => {
    console.log("Mission pressed:", missionId);
    // Navigate to mission details or start mission
  };

  const handleFindFriends = () => {
    console.log("Find friends pressed");
    // Navigate to friends screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <QuestHeader
          title="Mùa hè rực lửa của Eddy"
          subtitle=""
          timeRemaining="22 NGÀY"
          characterAvatar="eddy"
        />

        <View style={styles.content}>
          <QuestMission
            title="Kiếm 30 Điểm nhiệm vụ"
            subtitle=""
            progress={0}
            total={30}
            icon="🔒"
          />

          <MissionSection title="Nhiệm vụ bạn bè" timeRemaining="4 NGÀY">
            <FriendQuestCard
              title="Theo dõi người bạn đầu tiên"
              subtitle=""
              progress={0}
              total={1}
              onFindFriends={handleFindFriends}
            />
          </MissionSection>

          <MissionSection
            title="Nhiệm vụ hằng ngày"
            timeRemaining="CÒN 7 TIẾNG"
          >
            <QuestMission
              title="Streak mở màn"
              subtitle=""
              progress={0}
              total={1}
              icon="🏆"
              onPress={() => handleMissionPress("daily-streak")}
            />
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
});
