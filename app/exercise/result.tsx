import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, ProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch, RootState } from "../../stores";
import { updateUserSettings } from "../../stores/userSlice";

interface ExerciseResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  perfectLesson?: boolean;
  streakIncreased?: boolean;
}

export default function ExerciseResultScreen() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams<{
    lessonId: string;
    score: string;
    totalQuestions: string;
    correctAnswers: string;
    xpEarned: string;
    perfectLesson?: string;
    streakIncreased?: string;
  }>();


  const { user } = useSelector((state: RootState) => state.user);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);

  const getResultImage = () => {
    if (result.perfectLesson) return require("../../assets/images/grade.png");
    if (accuracyPercentage >= 70) return require("../../assets/images/flower.png");
    return require("../../assets/images/love.png");
  };

  // Use ref to prevent multiple updates
  const hasUpdatedProgress = useRef(false);

  // Parse parameters with better error handling
  const result: ExerciseResult = {
    lessonId: params.lessonId || "1",
    score: parseInt(params.score || "0") || 0,
    totalQuestions: parseInt(params.totalQuestions || "10") || 10,
    correctAnswers: parseInt(params.correctAnswers || "0") || 0,
    xpEarned: parseInt(params.xpEarned || "0") || 0,
    perfectLesson: params.perfectLesson === "true",
    streakIncreased: params.streakIncreased === "true",
  };


  const accuracyPercentage = result.totalQuestions > 0
    ? (result.correctAnswers / result.totalQuestions) * 100
    : 0;


  useEffect(() => {

    // Prevent multiple updates
    if (hasUpdatedProgress.current) {
      return;
    }

    // Update user progress only once
    if (result.xpEarned > 0 && user && user.id) {

      dispatch(
        updateUserSettings({
          xp: (user.xp || 0) + result.xpEarned,
          streak: result.streakIncreased ? (user.streak || 0) + 1 : user.streak,
        })
      );

      // Mark as updated
      hasUpdatedProgress.current = true;
    }

    // Show streak celebration if streak increased
    if (result.streakIncreased && !hasUpdatedProgress.current) {
      const timer = setTimeout(() => {
        setShowStreakCelebration(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [params.lessonId]); // Only depend on lessonId to prevent re-runs for same lesson

  const handleContinue = () => {

    if (showStreakCelebration) {
      router.push("/streak/celebration");
    } else {
      router.push("/(tabs)/home");
    }
  };

  const handleTryAgain = () => {
    router.push(`/exercise/${result.lessonId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              router.push("/(tabs)/home");
            }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              {result.perfectLesson
                ? "Perfect!"
                : accuracyPercentage >= 70
                  ? "Great Job!"
                  : "Keep Trying!"}
            </Text>
            <Image source={getResultImage()} style={styles.resultEmoji} />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(accuracyPercentage)}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.xpEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {result.correctAnswers} of {result.totalQuestions} correct
            </Text>
            <ProgressBar
              progress={result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0}
              style={styles.progressBar}
            />
          </View>

          {result.streakIncreased && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>Streak increased!</Text>
            </View>
          )}
        </Card>

        {/* Achievements */}
        {result.perfectLesson && (
          <Card style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>Perfect Lesson!</Text>
            <Text style={styles.achievementDescription}>
              You answered all questions correctly!
            </Text>
            <Text style={styles.achievementReward}>Bonus: +5 XP</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          {accuracyPercentage < 70 && (
            <Button
              title="Try Again"
              variant="outline"
              onPress={handleTryAgain}
              style={styles.tryAgainButton}
            />
          )}
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: "flex-end",
    paddingTop: Sizes.md,
    paddingBottom: Sizes.sm,
  },
  closeButton: {
    padding: Sizes.sm,
    borderRadius: Sizes.sm,
    backgroundColor: Colors.border,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textLight,
  },
  resultCard: {
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    alignItems: "center",
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  resultTitle: {
    fontSize: Sizes.h2,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: Sizes.sm,
  },
  resultEmoji: {
    width: 100,
    height: 120,
    resizeMode: 'contain',
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: Sizes.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: Sizes.h3,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  statLabel: {
    fontSize: Sizes.caption,
    color: Colors.textLight,
  },
  progressSection: {
    width: "100%",
    marginBottom: Sizes.lg,
  },
  progressLabel: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.sm,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: Sizes.sm,
  },
  streakText: {
    fontSize: Sizes.body,
    fontWeight: "600",
    color: Colors.warning,
  },
  achievementCard: {
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    backgroundColor: Colors.success + "10",
    borderColor: Colors.success,
    borderWidth: 1,
  },
  achievementTitle: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: Colors.success,
    marginBottom: Sizes.sm,
  },
  achievementDescription: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    marginBottom: Sizes.sm,
  },
  achievementReward: {
    fontSize: Sizes.caption,
    color: Colors.success,
    fontWeight: "600",
  },
  actionButtons: {
    gap: Sizes.md,
    marginBottom: Sizes.xl,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
  tryAgainButton: {
    borderColor: Colors.primary,
  },
});
