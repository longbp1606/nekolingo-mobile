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

interface SourceOption {
  key: string;
  title: string;
  image: string;
}

const sources: SourceOption[] = [
  {
    key: "youtube",
    title: "YouTube",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/5ae4d4bc2af930b5bc002b5d0b7cbad7.svg",
  },
  {
    key: "news",
    title: "Tin tức/Báo chí/Blog",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/0d0c3c81ccd1fd2ea84371e6bf4546b3.svg",
  },
  {
    key: "social",
    title: "Facebook/Instagram",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/9eb3a5707704c76b653a5e85fbf9ca0e.svg",
  },
  {
    key: "tiktok",
    title: "TikTok",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/f2969a78ee365da5e7676dc6afd8c1b4.svg",
  },
  {
    key: "google",
    title: "Tìm kiếm Google",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/8e3f5e058dd4dd5eb43646c2d1f19b3c.svg",
  },
  {
    key: "friends",
    title: "Bạn bè/Gia đình",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/947546a876aaea3a9811abf4cca1b618.svg",
  },
  {
    key: "tv",
    title: "TV",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/b2a0faf7b835cf2ab9a75afe033fdad9.svg",
  },
  {
    key: "other",
    title: "Khác",
    image:
      "https://d35aaqx5ub95lt.cloudfront.net/images/hdyhau/d4419d84cb57b1295591e05cd60e45fb.svg",
  },
];

export default function SourceSelectionScreen() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const router = useRouter();

  const handleSourceSelect = (sourceKey: string) => {
    setSelectedSource(sourceKey);
  };

  const handleContinue = async () => {
    if (selectedSource) {
      try {
        // Store the selected source
        await AsyncStorage.setItem("selectedSource", selectedSource);

        router.push("/onboarding/reason-selection" as any);
      } catch (error) {
        console.error("Error saving source:", error);
      }
    }
  };

  const renderSourceItem = ({ item }: { item: SourceOption }) => (
    <TouchableOpacity
      style={[
        styles.sourceItem,
        selectedSource === item.key && styles.selectedItem,
      ]}
      onPress={() => handleSourceSelect(item.key)}
    >
      <Image source={{ uri: item.image }} style={styles.sourceIcon} />
      <Text style={styles.sourceText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <OnboardingProgressBar currentStep={2} totalSteps={6} />
      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Image
            source={require("../../assets/images/cat-writing.png")}
            style={styles.catImage}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.questionText}>
              Bạn biết đến Nekolingo từ đâu?
            </Text>
          </View>
        </View>

        <FlatList
          data={sources}
          renderItem={renderSourceItem}
          keyExtractor={(item) => item.key}
          numColumns={2}
          contentContainerStyle={styles.sourcesList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          disabled={!selectedSource}
          style={[
            styles.continueButton,
            !selectedSource && styles.disabledButton,
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
  sourcesList: {
    paddingBottom: Sizes.xl,
  },
  sourceItem: {
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
  sourceIcon: {
    width: 40,
    height: 40,
    marginBottom: Sizes.sm,
  },
  sourceText: {
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
