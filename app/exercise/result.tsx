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
import { useSelector } from "react-redux";
import { Button, Card, ProgressBar } from "../../components";
import { RootState } from "../../config/store";
import { Colors, Sizes } from "../../constants";
import { useHearts } from "../../hooks/useHearts";
import {
  ExplainAnswerResponse,
  useExplainAnswerMutation,
  useGetWeeklyStreakQuery,
} from "../../services/progressApiService";

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
  const { handleHeartCheck } = useHearts();
  const params = useLocalSearchParams<{
    lessonId: string;
    score: string;
    totalQuestions: string;
    correctAnswers: string;
    xpEarned: string;
    perfectLesson?: string;
    streakIncreased?: string;
  }>();

  const { user } = useSelector((state: RootState) => state.auth);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [explanations, setExplanations] = useState<ExplainAnswerResponse[]>([]);
  const [loadingExplanations, setLoadingExplanations] = useState(false);

  // API mutation for explaining answers
  const [explainAnswer] = useExplainAnswerMutation();

  // Get weekly streak data to check if today already has a streak
  const { data: weeklyStreakData } = useGetWeeklyStreakQuery(
    user?.id || user?._id || "",
    {
      skip: !user?.id && !user?._id,
    }
  );

  const fetchExplanationsForIncorrectExercises = async () => {
    if (loadingExplanations || (!user?.id && !user?._id)) return;

    setLoadingExplanations(true);
    try {
      // Since we can't easily get the specific exercises from navigation params,
      // we'll show a button that lets users get explanations for their mistakes
      // This could be improved by passing more data or creating an endpoint
      // to get recent exercise mistakes for a lesson
      console.log("Fetching explanations for lesson:", result.lessonId);

      // For now, we'll show a placeholder or implement a different approach
      setExplanations([]);
      setShowExplanations(true);
    } catch (error) {
      console.error("Error fetching explanations:", error);
    } finally {
      setLoadingExplanations(false);
    }
  };

  const getResultImage = () => {
    if (result.perfectLesson) return require("../../assets/images/grade.png");
    if (accuracyPercentage >= 70)
      return require("../../assets/images/flower.png");
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

  const accuracyPercentage =
    result.totalQuestions > 0
      ? (result.correctAnswers / result.totalQuestions) * 100
      : 0;

  // Helper function to check if today allows streak increase
  const canIncreaseStreakToday = () => {
    if (!weeklyStreakData?.week) {
      console.log("[StreakCheck] No weekly streak data available");
      return true; // Allow if no data (fallback)
    }

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const todayEntry = weeklyStreakData.week.find((day) => day.date === today);

    console.log("[StreakCheck] Today's date:", today);
    console.log("[StreakCheck] Today's entry:", todayEntry);

    // If today's status is "missed", user cannot increase streak anymore today
    if (todayEntry?.status === "missed") {
      console.log(
        "[StreakCheck] Today is marked as 'missed' - cannot increase streak"
      );
      return false;
    }

    // If today already has "streak", user already got their streak for today
    if (todayEntry?.status === "streak") {
      console.log(
        "[StreakCheck] Today already has streak - cannot increase again"
      );
      return false;
    }

    // If today's status is undefined or "freeze", user can potentially get a streak
    console.log("[StreakCheck] Today allows streak increase");
    return true;
  };

  // Determine if we should show celebration - only if streak increased AND today allows streak increase
  const shouldShowCelebration =
    result.streakIncreased && canIncreaseStreakToday();

  console.log("[StreakCheck] result.streakIncreased:", result.streakIncreased);
  console.log("[StreakCheck] shouldShowCelebration:", shouldShowCelebration);

  /*
   * Streak Celebration Logic:
   * - Show celebration ONLY if:
   *   1. Exercise result indicates streak increased (result.streakIncreased = true)
   *   2. AND today allows streak increase (canIncreaseStreakToday() = true)
   *
   * Today's status meanings:
   * - "streak": User already has a streak for today → NO celebration
   * - "missed": User missed their chance for today → NO celebration
   * - "freeze": User used a freeze → CAN get celebration if completing exercise
   * - undefined: No data for today → CAN get celebration (fallback)
   */

  useEffect(() => {
    // Show streak celebration if streak increased and today didn't already have a streak
    if (shouldShowCelebration) {
      const timer = setTimeout(() => {
        setShowStreakCelebration(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowCelebration]);

  const handleContinue = () => {
    if (showStreakCelebration) {
      router.push("/streak/celebration");
    } else {
      router.push("/(tabs)/home");
    }
  };

  const handleShowExplanations = async () => {
    if (!showExplanations) {
      setLoadingExplanations(true);
      await fetchExplanationsForIncorrectExercises();
      setLoadingExplanations(false);
    }
    setShowExplanations(!showExplanations);
  };

  const handleTryAgain = () => {
    // Check hearts before allowing retry
    handleHeartCheck(() => {
      router.push(`/exercise/${result.lessonId}`);
    });
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
              progress={
                result.totalQuestions > 0
                  ? result.correctAnswers / result.totalQuestions
                  : 0
              }
              style={styles.progressBar}
            />
          </View>

          {shouldShowCelebration && (
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

        {/* Detailed Results Button */}
        {result.correctAnswers < result.totalQuestions && (
          <Card style={styles.explanationCard}>
            <Button
              title={
                showExplanations
                  ? "Hide Detailed Results"
                  : "Show Detailed Results"
              }
              variant="outline"
              onPress={handleShowExplanations}
              style={styles.explanationButton}
            />

            {showExplanations && (
              <View style={styles.explanationsContainer}>
                {loadingExplanations ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                      Loading explanations...
                    </Text>
                  </View>
                ) : explanations.length > 0 ? (
                  <ScrollView style={styles.explanationsList}>
                    {explanations.map((explanation, index) => (
                      <View key={index} style={styles.explanationItem}>
                        <Text style={styles.explanationTitle}>
                          Question {index + 1}
                        </Text>
                        <Text style={styles.explanationText}>
                          {explanation.explanation}
                        </Text>
                        {explanation.grammar && (
                          <View style={styles.grammarSection}>
                            <Text style={styles.grammarTitle}>
                              Grammar Point:
                            </Text>
                            <Text style={styles.grammarText}>
                              {explanation.grammar}
                            </Text>
                          </View>
                        )}
                        <View style={styles.answerComparison}>
                          <Text style={styles.correctAnswerLabel}>
                            Correct:
                          </Text>
                          <Text style={styles.correctAnswer}>
                            {typeof explanation.correct_answer === "string"
                              ? explanation.correct_answer
                              : JSON.stringify(explanation.correct_answer)}
                          </Text>
                          <Text style={styles.userAnswerLabel}>
                            Your answer:
                          </Text>
                          <Text style={styles.userAnswer}>
                            {typeof explanation.user_answer === "string"
                              ? explanation.user_answer
                              : JSON.stringify(explanation.user_answer)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noExplanationsText}>
                    No explanations available for incorrect answers.
                  </Text>
                )}
              </View>
            )}
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
    resizeMode: "contain",
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
  explanationCard: {
    padding: Sizes.lg,
    marginBottom: Sizes.md,
  },
  explanationButton: {
    marginBottom: Sizes.md,
  },
  explanationsContainer: {
    marginTop: Sizes.md,
  },
  loadingContainer: {
    padding: Sizes.lg,
    alignItems: "center",
  },
  loadingText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  explanationsList: {
    maxHeight: 300,
  },
  explanationItem: {
    padding: Sizes.md,
    marginBottom: Sizes.md,
    backgroundColor: Colors.card,
    borderRadius: Sizes.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  explanationTitle: {
    fontSize: Sizes.body,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: Sizes.sm,
  },
  explanationText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    marginBottom: Sizes.sm,
    lineHeight: 20,
  },
  grammarSection: {
    backgroundColor: Colors.card,
    padding: Sizes.sm,
    borderRadius: Sizes.xs,
    marginBottom: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  grammarTitle: {
    fontSize: Sizes.caption,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  grammarText: {
    fontSize: Sizes.caption,
    color: Colors.primary,
    fontStyle: "italic",
  },
  answerComparison: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Sizes.xs,
  },
  correctAnswerLabel: {
    fontSize: Sizes.caption,
    color: Colors.success,
    fontWeight: "600",
  },
  correctAnswer: {
    fontSize: Sizes.caption,
    color: Colors.success,
    backgroundColor: Colors.card,
    paddingHorizontal: Sizes.xs,
    paddingVertical: 2,
    borderRadius: Sizes.xs,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  userAnswerLabel: {
    fontSize: Sizes.caption,
    color: Colors.error,
    fontWeight: "600",
    marginLeft: Sizes.sm,
  },
  userAnswer: {
    fontSize: Sizes.caption,
    color: Colors.error,
    backgroundColor: Colors.card,
    paddingHorizontal: Sizes.xs,
    paddingVertical: 2,
    borderRadius: Sizes.xs,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  noExplanationsText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    textAlign: "center",
    padding: Sizes.lg,
    fontStyle: "italic",
  },
});
