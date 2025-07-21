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

  const missions = [
    {
      id: 'daily-streak',
      title: 'Streak mở màn',
      subtitle: '',
      progress: 1,
      total: 1,
      icon: '🏆',
    },
    {
      id: 'login-bonus',
      title: 'Điểm danh ngày mới',
      subtitle: '',
      progress: 1,
      total: 2,
      icon: '🎁',
    },
  ];


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

          <MissionSection title="Nhiệm vụ bạn bè" timeRemaining="4 NGÀY" >
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
            timeRemaining="CÒN 7 TIẾNG"
          >
            <View style={styles.missionListWrapper}>
              {missions.map((mission, index) => (
                <View key={index} style={styles.missionItem} >
                  {index > 0 && <View style={styles.separator} />}
                  <QuestMission
                    title={mission.title}
                    subtitle={mission.subtitle}
                    progress={mission.progress}
                    total={mission.total}
                    icon={mission.icon}
                    onPress={() => handleMissionPress(mission.id)}
                    style={{ padding: 0 }}
                    isCompleted={mission.progress >= mission.total}
                  />
                </View>
              ))}
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

});
