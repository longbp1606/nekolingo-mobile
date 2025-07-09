import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DailyPracticeCard,
  PracticeItem,
  PracticeSection,
} from "../../../components/exercise";

export default function ExerciseScreen() {
  const handleUnlockPractice = () => {
    console.log("Unlock practice pressed");
    // Navigate to daily practice
  };

  const handlePracticeItemPress = (type: string) => {
    console.log("Practice item pressed:", type);
    // Navigate to specific practice type
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerGradient}>
          <DailyPracticeCard
            title="Luyện tập chuyên sâu"
            subtitle="Tập trung ôn luyện những điểm còn yếu"
            character="duo"
            onUnlock={handleUnlockPractice}
          />
        </View>

        <View style={styles.content}>
          <PracticeSection title="Luyện giao tiếp" badge="SUPER">
            <PracticeItem
              title="Luyện nói"
              icon="🎤"
              iconColor="#4CAF50"
              onPress={() => handlePracticeItemPress("speaking")}
            />
            <PracticeItem
              title="Luyện nghe"
              icon="🔊"
              iconColor="#2196F3"
              onPress={() => handlePracticeItemPress("listening")}
            />
          </PracticeSection>

          <PracticeSection title="Góc học tập">
            <PracticeItem
              title="Các lỗi sai cũ"
              icon="🔄"
              iconColor="#FF9800"
              onPress={() => handlePracticeItemPress("mistakes")}
            />
            <PracticeItem
              title="Ôn luyện"
              icon="📚"
              iconColor="#F44336"
              onPress={() => handlePracticeItemPress("review")}
            />
          </PracticeSection>
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
  headerGradient: {
    backgroundColor: "#2E7D32",
  },
  content: {
    paddingVertical: 20,
  },
});
