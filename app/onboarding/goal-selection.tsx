import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { BackButton, Button, OnboardingProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch } from "../../stores";
import { completeOnboarding, setGoal } from "../../stores/onboardingSlice";

interface GoalOption {
  key: string;
  time: string;
  rank: string;
  words: string;
}

const goals: GoalOption[] = [
  {
    key: "easy",
    time: "5 phút / ngày",
    rank: "Dễ",
    words: "25 từ / tuần",
  },
  {
    key: "medium",
    time: "10 phút / ngày",
    rank: "Vừa",
    words: "50 từ / tuần",
  },
  {
    key: "hard",
    time: "15 phút / ngày",
    rank: "Khó",
    words: "75 từ / tuần",
  },
  {
    key: "extreme",
    time: "20 phút / ngày",
    rank: "Siêu khó",
    words: "100 từ / tuần",
  },
];

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleGoalSelect = (goalKey: string) => {
    setSelectedGoal(goalKey);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      dispatch(setGoal(selectedGoal));
      dispatch(completeOnboarding()); // Mark onboarding as completed
      router.push("/onboarding/register" as any);
    }
  };

  const renderGoalItem = ({ item }: { item: GoalOption }) => (
    <TouchableOpacity
      style={[
        styles.goalItem,
        selectedGoal === item.key && styles.selectedItem,
      ]}
      onPress={() => handleGoalSelect(item.key)}
    >
      <View style={styles.goalContent}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.rankText}>{item.rank}</Text>
        <Text style={styles.wordsText}>{item.words}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <OnboardingProgressBar currentStep={6} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Image
            source={require("../../assets/images/cat-writing.png")}
            style={styles.catImage}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>
              Mục tiêu học hằng ngày của bạn là gì?
            </Text>
          </View>
        </View>

        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.goalsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          disabled={!selectedGoal}
          style={[
            styles.continueButton,
            !selectedGoal && styles.disabledButton,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.md,
    paddingTop: 120, // Space for back button and progress bar
  },
  questionSection: {
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  catImage: {
    width: 80,
    height: 80,
    marginBottom: Sizes.md,
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: Sizes.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: Sizes.h3,
    color: Colors.textDark,
    textAlign: "center",
    fontWeight: "500",
  },
  goalsList: {
    paddingBottom: Sizes.xl,
  },
  goalItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: "#e6fdff",
  },
  goalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "600",
    flex: 1,
  },
  rankText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  wordsText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    flex: 1,
    textAlign: "right",
  },
  footer: {
    paddingHorizontal: Sizes.md,
    paddingBottom: Sizes.xl,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: Sizes.md,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
  },
});
