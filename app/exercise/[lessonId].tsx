import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { useGetLessonByIdQuery } from "../../services/lessonApiService";

export default function ExerciseScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();

  const {
    data: currentLesson,
    isLoading: loading,
    error,
  } = useGetLessonByIdQuery(
    { lessonId: lessonId || "" },
    {
      skip: !lessonId,
    }
  );

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(5); // Thêm số mạng

  const correctAnswersRef = useRef(0);

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
  }, [correctAnswers]);

  useEffect(() => {
    if (currentLesson) {
      console.log("Current lesson fetched successfully:", currentLesson);
    }
  }, [currentLesson]);

  const currentExercise = currentLesson?.exercises?.[currentExerciseIndex];
  const totalExercises = currentLesson?.exercises?.length || 0;
  const progress =
    totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted && !isProcessing) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentExercise || isProcessing) return;

    setIsProcessing(true);
    setIsAnswerSubmitted(true);

    const isCorrect = Array.isArray(currentExercise.correct_answer)
      ? currentExercise.correct_answer.includes(selectedAnswer)
      : currentExercise.correct_answer === selectedAnswer;

    if (isCorrect) {
      setCorrectAnswers((prev) => {
        const newCount = prev + 1;
        correctAnswersRef.current = newCount;
        return newCount;
      });
    } else {
      setLives((prev) => Math.max(0, prev - 1)); // Trừ mạng khi sai
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 100);
  };

  const handleNext = () => {
    if (isProcessing) return;

    if (currentExerciseIndex < totalExercises - 1) {
      setIsProcessing(true);
      setTimeout(() => {
        setCurrentExerciseIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setIsProcessing(false);
      }, 100);
    } else {
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    const finalCorrectAnswers = correctAnswersRef.current;
    const score = Math.round((finalCorrectAnswers / totalExercises) * 100);
    const xpEarned = Math.round(
      (finalCorrectAnswers / totalExercises) * (currentLesson?.xp_reward || 10)
    );
    const perfectLesson = finalCorrectAnswers === totalExercises;
    const streakIncreased = finalCorrectAnswers / totalExercises >= 0.7;

    const navigationParams = {
      lessonId: lessonId || "1",
      score: score.toString(),
      totalQuestions: totalExercises.toString(),
      correctAnswers: finalCorrectAnswers.toString(),
      xpEarned: xpEarned.toString(),
      perfectLesson: perfectLesson.toString(),
      streakIncreased: streakIncreased.toString(),
    };

    try {
      router.push({
        pathname: "/exercise/result",
        params: navigationParams,
      });
    } catch (error) {
      console.error("Navigation error:", error);
      router.push("/(tabs)/home");
    }
  };

  const getAnswerStyle = (answer: string) => {
    if (!isAnswerSubmitted) {
      return [
        styles.answerButton,
        selectedAnswer === answer && styles.selectedAnswer,
      ];
    }

    const isCorrect = Array.isArray(currentExercise?.correct_answer)
      ? currentExercise?.correct_answer.includes(answer)
      : currentExercise?.correct_answer === answer;

    if (isCorrect) {
      return [styles.answerButton, styles.correctAnswer];
    }

    if (selectedAnswer === answer && !isCorrect) {
      return [styles.answerButton, styles.wrongAnswer];
    }

    return [styles.answerButton, styles.disabledAnswer];
  };

  const getAnswerTextStyle = (answer: string) => {
    if (!isAnswerSubmitted) {
      return [
        styles.answerText,
        selectedAnswer === answer && styles.selectedAnswerText,
      ];
    }

    const isCorrect = Array.isArray(currentExercise?.correct_answer)
      ? currentExercise?.correct_answer.includes(answer)
      : currentExercise?.correct_answer === answer;

    if (isCorrect) {
      return [styles.answerText, styles.correctAnswerText];
    }

    if (selectedAnswer === answer && !isCorrect) {
      return [styles.answerText, styles.wrongAnswerText];
    }

    return [styles.answerText, styles.disabledAnswerText];
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
          <Text style={styles.title}>Exercise</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentLesson || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Exercise</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error ? "Failed to load exercise" : "Exercise not found"}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.goBackButton}
          />
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

        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} style={styles.progressBar} />
          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>
              {currentExerciseIndex + 1} / {totalExercises}
            </Text>
            <View style={styles.livesContainer}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.heart}>
                  {i < lives ? "❤️" : "🤍"}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.exerciseCard}>
          <Text style={styles.questionText}>{currentExercise.question}</Text>

          {currentExercise.options && (
            <View style={styles.optionsContainer}>
              {currentExercise.options.map((option: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={getAnswerStyle(option)}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={isAnswerSubmitted || isProcessing}
                >
                  <Text style={getAnswerTextStyle(option)}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.actionContainer}>
          {!isAnswerSubmitted ? (
            <Button
              title="Submit"
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer || isProcessing}
              style={[
                styles.submitButton,
                (!selectedAnswer || isProcessing) && styles.disabledButton,
              ]}
            />
          ) : (
            <Button
              title={
                currentExerciseIndex < totalExercises - 1
                  ? "Next"
                  : "View Results"
              }
              onPress={handleNext}
              disabled={isProcessing}
              style={[
                styles.submitButton,
                isProcessing && styles.disabledButton,
              ]}
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
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  progressContainer: {
    flex: 1,
    marginLeft: Sizes.md,
  },
  progressBar: {
    height: 6,
    marginBottom: Sizes.xs,
  },
  progressText: {
    fontSize: Sizes.caption,
    color: Colors.textLight,
    textAlign: "right",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.md,
  },
  exerciseCard: {
    padding: Sizes.lg,
    marginBottom: Sizes.md,
  },
  questionText: {
    fontSize: Sizes.h3,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: Sizes.lg,
    textAlign: "center",
  },
  optionsContainer: {
    gap: Sizes.md,
    marginBottom: Sizes.lg,
  },
  answerButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    alignItems: "center",
  },
  selectedAnswer: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  correctAnswer: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  wrongAnswer: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + "10",
  },
  disabledAnswer: {
    opacity: 0.5,
  },
  answerText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "500",
  },
  selectedAnswerText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  correctAnswerText: {
    color: Colors.success,
    fontWeight: "600",
  },
  wrongAnswerText: {
    color: Colors.error,
    fontWeight: "600",
  },
  disabledAnswerText: {
    color: Colors.textLight,
  },
  hintContainer: {
    backgroundColor: Colors.info + "10",
    padding: Sizes.md,
    borderRadius: Sizes.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  hintLabel: {
    fontSize: Sizes.caption,
    color: Colors.info,
    fontWeight: "600",
    marginBottom: Sizes.xs,
  },
  hintText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
  },
  actionContainer: {
    paddingBottom: Sizes.xl,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.border,
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
  goBackButton: {
    marginTop: Sizes.md,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  livesContainer: {
    flexDirection: "row",
  },
  heart: {
    fontSize: 16,
    marginHorizontal: 1,
  },
});
