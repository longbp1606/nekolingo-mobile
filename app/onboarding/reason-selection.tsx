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

interface ReasonOption {
  key: string;
  title: string;
  image: string;
}

const reasons: ReasonOption[] = [
  {
    key: "study",
    title: "Hỗ trợ việc học tập",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/d7315c6c7bbeba67df5ebda771d33da1.svg",
  },
  {
    key: "connect",
    title: "Kết nối với mọi người",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/484f1c9610935dd40094a9f7cf06e009.svg",
  },
  {
    key: "time",
    title: "Sử dụng thời gian hiệu quả",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/f382d7a1e1a958dc07fca0deae2d16b7.svg",
  },
  {
    key: "career",
    title: "Phát triển sự nghiệp",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/61a06f02b3b988d1c388d484bc0e52e6.svg",
  },
  {
    key: "travel",
    title: "Chuẩn bị đi du lịch",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/5bbfb55fd21e21012a228bcef29bb557.svg",
  },
  {
    key: "entertainment",
    title: "Giải trí",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/ab81d610a8a79f174a4db0a6085e7e2c.svg",
  },
  {
    key: "other",
    title: "Khác",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/0e2332e8d4074ed5db4ca9152ffd0d25.svg",
  },
];

export default function ReasonSelectionScreen() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const router = useRouter();

  const handleReasonSelect = (reasonKey: string) => {
    setSelectedReason(reasonKey);
  };

  const handleContinue = async () => {
    if (selectedReason) {
      try {
        // Store the selected reason
        await AsyncStorage.setItem("selectedReason", selectedReason);

        router.push("/onboarding/level-selection" as any);
      } catch (error) {
        console.error("Error saving reason:", error);
      }
    }
  };

  const renderReasonItem = ({ item }: { item: ReasonOption }) => (
    <TouchableOpacity
      style={[
        styles.reasonItem,
        selectedReason === item.key && styles.selectedItem,
      ]}
      onPress={() => handleReasonSelect(item.key)}
    >
      <Image source={{ uri: item.image }} style={styles.reasonIcon} />
      <Text style={styles.reasonText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <OnboardingProgressBar currentStep={3} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Image
            source={require("../../assets/images/cat-writing.png")}
            style={styles.catImage}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>
              Tại sao bạn học ngôn ngữ đó?
            </Text>
          </View>
        </View>

        <FlatList
          data={reasons}
          renderItem={renderReasonItem}
          keyExtractor={(item) => item.key}
          numColumns={2}
          contentContainerStyle={styles.reasonsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          disabled={!selectedReason}
          style={[
            styles.continueButton,
            !selectedReason && styles.disabledButton,
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
  reasonsList: {
    paddingBottom: Sizes.xl,
  },
  reasonItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: Sizes.md,
    margin: Sizes.xs,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: "#e6fdff",
  },
  reasonIcon: {
    width: 40,
    height: 40,
    marginBottom: Sizes.sm,
  },
  reasonText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    textAlign: "center",
    fontWeight: "500",
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
