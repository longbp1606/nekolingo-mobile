import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { BackButton, Button, OnboardingProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch } from "../../stores";
import { setCurrentStep } from "../../stores/onboardingSlice";

interface ResultItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const results: ResultItem[] = [
  {
    id: "1",
    title: "Tự tin giao tiếp",
    description: "Các bài học nói và nghe không hề áp lực",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/958e9a5aac8a0aeb099e08c28e327de7.svg",
  },
  {
    id: "2",
    title: "Kho từ vựng đa dạng",
    description: "Các từ vựng phổ biến và cụm từ thiết thực",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/bc1008ae41c90c9b1a6f63bb9e142f7f.svg",
  },
  {
    id: "3",
    title: "Tạo thói quen học tập",
    description: "Nhắc nhở thông minh, thử thách vui nhộn",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/funboarding/3757137c3beb1fbf0bfe21fdf9254023.svg",
  },
];

export default function ResultsPreviewScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleContinue = () => {
    dispatch(setCurrentStep(8));
    router.push("/onboarding/goal-selection" as any);
  };

  const renderResultItem = ({ item }: { item: ResultItem }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.image }} style={styles.resultIcon} />
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <OnboardingProgressBar currentStep={5} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Image
            source={require("../../assets/images/cat-writing.png")}
            style={styles.catImage}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>
              Và đây là những thành quả bạn sẽ có thể đạt được!
            </Text>
          </View>
        </View>

        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          style={styles.continueButton}
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
  resultsList: {
    paddingBottom: Sizes.xl,
  },
  resultItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    flexDirection: "row",
    alignItems: "center",
  },
  resultIcon: {
    width: 50,
    height: 50,
    marginRight: Sizes.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: Sizes.h4,
    color: Colors.textDark,
    fontWeight: "bold",
    marginBottom: Sizes.xs,
  },
  resultDescription: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    lineHeight: 20,
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
});
