import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch, RootState } from "../../stores";
import { fetchLessonById } from "../../stores/lessonsSlice";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentLesson, loading, error } = useSelector(
    (state: RootState) => state.lessons
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchLessonById(id));
    }
  }, [dispatch, id]);

  const handleStartLesson = () => {
    // Navigate to the lesson practice screen
    router.push(`/lessons/${id}/practice` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lesson</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lesson</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button
            title="Try Again"
            onPress={() => id && dispatch(fetchLessonById(id))}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lesson</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentLesson.title}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
            <Text style={styles.lessonLevel}>Level {currentLesson.level}</Text>
          </View>

          <Text style={styles.lessonDescription}>
            {currentLesson.description}
          </Text>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Status</Text>
            <Text style={styles.progressText}>
              {currentLesson.isCompleted ? "Completed" : "Not Started"}
            </Text>
          </View>

          <View style={styles.rewardSection}>
            <Text style={styles.rewardLabel}>Completion Reward</Text>
            <Text style={styles.rewardXP}>+{currentLesson.xpReward} XP</Text>
          </View>
        </Card>

        <Button
          title={currentLesson.isCompleted ? "Practice Again" : "Start Lesson"}
          onPress={handleStartLesson}
          style={styles.startButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.sm,
  },
  backButton: {
    padding: Sizes.sm,
    marginRight: Sizes.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.md,
  },
  lessonCard: {
    padding: Sizes.lg,
    marginBottom: Sizes.md,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  lessonTitle: {
    fontSize: Sizes.h3,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  lessonLevel: {
    fontSize: Sizes.caption,
    color: Colors.primary,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.lg,
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: Sizes.lg,
  },
  progressLabel: {
    fontSize: Sizes.body,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  progressBar: {
    marginBottom: Sizes.sm,
  },
  progressText: {
    fontSize: Sizes.caption,
    color: Colors.textLight,
  },
  rewardSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  rewardLabel: {
    fontSize: Sizes.body,
    fontWeight: "600",
    color: Colors.text,
  },
  rewardXP: {
    fontSize: Sizes.body,
    color: Colors.warning,
    fontWeight: "bold",
  },
  objectivesSection: {
    marginBottom: Sizes.md,
  },
  objectivesLabel: {
    fontSize: Sizes.body,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  objectiveItem: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.xs,
    lineHeight: 20,
  },
  startButton: {
    marginBottom: Sizes.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
  },
  errorText: {
    fontSize: Sizes.body,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Sizes.md,
  },
  retryButton: {
    marginTop: Sizes.md,
  },
});
