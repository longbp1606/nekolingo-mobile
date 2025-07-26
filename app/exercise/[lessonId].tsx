import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ProgressBar } from "../../components";
import {
  Exercise,
  ExerciseRenderer,
  MatchOption,
} from "../../components/exercise";
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
  const [lives, setLives] = useState(5);

  // Additional state for different question types
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedMatches, setSelectedMatches] = useState<{
    left?: string;
    right?: string;
  }>({});

  const correctAnswersRef = useRef(0);

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
  }, [correctAnswers]);

  useEffect(() => {
    if (currentLesson) {
      console.log("Current lesson fetched successfully:", currentLesson);
    }
  }, [currentLesson]);

  const currentExercise = currentLesson?.exercises?.[
    currentExerciseIndex
  ] as Exercise;
  const totalExercises = currentLesson?.exercises?.length || 0;
  const progress =
    totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  // Reset all answer states
  const resetAnswerStates = () => {
    setSelectedAnswer(null);
    setReorderedWords([]);
    setMatchedPairs({});
    setSelectedMatches({});
  };

  // Initialize reordered words for reorder questions
  useEffect(() => {
    if (
      currentExercise?.question_format === "reorder" &&
      Array.isArray(currentExercise.options)
    ) {
      try {
        const options = currentExercise.options as string[];
        setReorderedWords([...options]);
      } catch (error) {
        console.error("Error setting up reorder words:", error);
        setReorderedWords([]);
      }
    }
  }, [currentExercise]);

  // Handle reorder words change
  const handleReorderWords = (newWords: string[]) => {
    setReorderedWords(newWords);
    setSelectedAnswer(newWords.join(" "));
  };

  // Handle match pairs change
  const handleMatchPairs = (newPairs: { [key: string]: string }) => {
    setMatchedPairs(newPairs);
    // For match questions, we'll validate in submit
  };

  // Handle answer selection based on question format
  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted && !isProcessing && currentExercise) {
      try {
        switch (currentExercise.question_format) {
          case "multiple_choice":
          case "fill_in_blank":
          case "listening":
            setSelectedAnswer(answer);
            break;
          case "image_select":
            // For image select, answer is the value property
            setSelectedAnswer(answer);
            break;
          case "reorder":
            // Handle word reordering - not used in this function
            break;
          case "match":
            // Handle matching - not used in this function
            break;
          default:
            console.warn(
              "Unknown question format:",
              currentExercise.question_format
            );
            setSelectedAnswer(answer);
        }
      } catch (error) {
        console.error("Error handling answer selection:", error);
        Alert.alert("Error", "Failed to select answer. Please try again.");
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentExercise || isProcessing) return;

    // Check if we have a valid answer based on question format
    const hasValidAnswer = () => {
      switch (currentExercise.question_format) {
        case "multiple_choice":
        case "fill_in_blank":
        case "listening":
        case "image_select":
          return selectedAnswer !== null;
        case "reorder":
          return reorderedWords.length > 0;
        case "match":
          return Object.keys(matchedPairs).length > 0;
        default:
          return selectedAnswer !== null;
      }
    };

    if (!hasValidAnswer()) return;

    setIsProcessing(true);
    setIsAnswerSubmitted(true);

    try {
      let isCorrect = false;

      switch (currentExercise.question_format) {
        case "multiple_choice":
        case "fill_in_blank":
        case "listening":
        case "image_select":
          if (Array.isArray(currentExercise.correct_answer)) {
            isCorrect = (currentExercise.correct_answer as string[]).includes(
              selectedAnswer!
            );
          } else {
            isCorrect = currentExercise.correct_answer === selectedAnswer;
          }
          break;
        case "reorder":
          const userAnswer = reorderedWords.join(" ");
          isCorrect =
            typeof currentExercise.correct_answer === "string"
              ? currentExercise.correct_answer.toLowerCase() ===
                userAnswer.toLowerCase()
              : false;
          break;
        case "match":
          // For match questions, check if all pairs are correctly matched
          if (Array.isArray(currentExercise.correct_answer)) {
            const correctPairs =
              currentExercise.correct_answer as MatchOption[];
            isCorrect = correctPairs.every(
              (pair) => matchedPairs[pair.left] === pair.right
            );
          }
          break;
        default:
          isCorrect = currentExercise.correct_answer === selectedAnswer;
      }

      if (isCorrect) {
        setCorrectAnswers((prev) => {
          const newCount = prev + 1;
          correctAnswersRef.current = newCount;
          return newCount;
        });
      } else {
        setLives((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error validating answer:", error);
      Alert.alert("Error", "Failed to validate answer. Please try again.");
      setLives((prev) => Math.max(0, prev - 1));
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
        resetAnswerStates(); // Reset all answer states
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

    try {
      let isCorrect = false;
      if (currentExercise?.correct_answer) {
        if (Array.isArray(currentExercise.correct_answer)) {
          // Check if it's a string array
          const stringArray = currentExercise.correct_answer.filter(
            (item) => typeof item === "string"
          ) as string[];
          isCorrect = stringArray.includes(answer);
        } else if (typeof currentExercise.correct_answer === "string") {
          isCorrect = currentExercise.correct_answer === answer;
        }
      }

      if (isCorrect) {
        return [styles.answerButton, styles.correctAnswer];
      }

      if (selectedAnswer === answer && !isCorrect) {
        return [styles.answerButton, styles.wrongAnswer];
      }

      return [styles.answerButton, styles.disabledAnswer];
    } catch (error) {
      console.error("Error in getAnswerStyle:", error);
      return [styles.answerButton, styles.disabledAnswer];
    }
  };

  const getAnswerTextStyle = (answer: string) => {
    if (!isAnswerSubmitted) {
      return [
        styles.answerText,
        selectedAnswer === answer && styles.selectedAnswerText,
      ];
    }

    try {
      let isCorrect = false;
      if (currentExercise?.correct_answer) {
        if (Array.isArray(currentExercise.correct_answer)) {
          // Check if it's a string array
          const stringArray = currentExercise.correct_answer.filter(
            (item) => typeof item === "string"
          ) as string[];
          isCorrect = stringArray.includes(answer);
        } else if (typeof currentExercise.correct_answer === "string") {
          isCorrect = currentExercise.correct_answer === answer;
        }
      }

      if (isCorrect) {
        return [styles.answerText, styles.correctAnswerText];
      }

      if (selectedAnswer === answer && !isCorrect) {
        return [styles.answerText, styles.wrongAnswerText];
      }

      return [styles.answerText, styles.disabledAnswerText];
    } catch (error) {
      console.error("Error in getAnswerTextStyle:", error);
      return [styles.answerText, styles.disabledAnswerText];
    }
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

          <ExerciseRenderer
            exercise={currentExercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
            reorderedWords={reorderedWords}
            onReorderWords={handleReorderWords}
            matchedPairs={matchedPairs}
            onMatchPairs={handleMatchPairs}
          />
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
  // Styles for image options
  imageOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: Sizes.md,
  },
  imageOption: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: Sizes.sm,
    padding: Sizes.sm,
    marginBottom: Sizes.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedImageOption: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
  },
  optionImage: {
    width: 60,
    height: 60,
    borderRadius: Sizes.sm,
    marginBottom: Sizes.xs,
  },
  imageOptionText: {
    fontSize: Sizes.body,
    color: Colors.text,
    textAlign: "center",
  },
  // Styles for reorder exercise
  reorderContainer: {
    marginVertical: Sizes.md,
  },
  reorderInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.md,
    textAlign: "center",
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Sizes.md,
  },
  wordButton: {
    backgroundColor: Colors.card,
    borderRadius: Sizes.sm,
    padding: Sizes.sm,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordText: {
    fontSize: Sizes.body,
    color: Colors.text,
  },
  sentencePreview: {
    backgroundColor: Colors.background,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    minHeight: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sentenceText: {
    fontSize: Sizes.body,
    color: Colors.text,
    textAlign: "center",
  },
  // Styles for match exercise
  matchContainer: {
    marginVertical: Sizes.md,
  },
  matchInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.md,
    textAlign: "center",
  },
  matchPair: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
  },
  matchLeft: {
    flex: 1,
    fontSize: Sizes.body,
    color: Colors.text,
  },
  matchArrow: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginHorizontal: Sizes.sm,
  },
  matchRight: {
    flex: 1,
    fontSize: Sizes.body,
    color: Colors.text,
    textAlign: "right",
  },
});
