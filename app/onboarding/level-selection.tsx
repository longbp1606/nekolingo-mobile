import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { BackButton, Button, OnboardingProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";

interface LevelOption {
  key: number;
  title: string;
  image: string;
}

const levels: LevelOption[] = [
  {
    key: 0,
    title: "Tôi mới học Tiếng Anh",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/5f3f4451d9b4ceb393aa44aa3b44f8ff.svg",
  },
  {
    key: 1,
    title: "Tôi biết một vài từ thông dụng",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/06f993f9019fb13ce4741ba9fe2cfb41.svg",
  },
  {
    key: 2,
    title: "Tôi có thể giao tiếp cơ bản",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/42a5b255caeca300ca1a80bb69f5bb16.svg",
  },
  {
    key: 3,
    title: "Tôi có thể nói về nhiều chủ đề",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/c428ae5ee9c14e872d59ae26543c6fda.svg",
  },
  {
    key: 4,
    title: "Tôi có thể thảo luận sâu về hầu hết các chủ đề",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/cd5dbf897151b9edc42919324382e4b7.svg",
  },
];

export default function LevelSelectionScreen() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const router = useRouter();

  const handleLevelSelect = (levelKey: number) => {
    setSelectedLevel(levelKey);
  };

  const handleContinue = async () => {
    if (selectedLevel !== null) {
      try {
        // Store the selected level
        await AsyncStorage.setItem("selectedLevel", selectedLevel.toString());

        router.push("/onboarding/results-preview" as any);
      } catch (error) {
        console.error("Error saving level:", error);
      }
    }
  };

  const renderLevelItem = ({ item }: { item: LevelOption }) => (
    <TouchableOpacity
      style={[
        styles.levelItem,
        selectedLevel === item.key && styles.selectedItem,
      ]}
      onPress={() => handleLevelSelect(item.key)}
    >
      <Image source={{ uri: item.image }} style={styles.levelIcon} />
      <Text style={styles.levelText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <OnboardingProgressBar currentStep={4} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Image
            source={require("../../assets/images/cat-writing.png")}
            style={styles.catImage}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>
              Trình độ tiếng Anh của bạn ở mức nào?
            </Text>
          </View>
        </View>

        <FlatList
          data={levels}
          renderItem={renderLevelItem}
          keyExtractor={(item) => item.key.toString()}
          contentContainerStyle={styles.levelsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          disabled={selectedLevel === null}
          style={[
            styles.continueButton,
            selectedLevel === null && styles.disabledButton,
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
  levelsList: {
    paddingBottom: Sizes.xl,
  },
  levelItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: "#e6fdff",
  },
  levelIcon: {
    width: 40,
    height: 40,
    marginRight: Sizes.md,
  },
  levelText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "500",
    flex: 1,
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
