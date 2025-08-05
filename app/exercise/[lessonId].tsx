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
import { useSelector } from "react-redux";
import { Button, Card, ProgressBar } from "../../components";
import {
  Exercise,
  ExerciseRenderer,
  MatchOption,
} from "../../components/exercise";
import { RootState } from "../../config/store";
import { Colors, Sizes } from "../../constants";
import { useHearts } from "../../hooks/useHearts";
import { useGetLessonByIdQuery } from "../../services/lessonApiService";
import {
  ExerciseAnswer,
  useCompleteFullLessonMutation,
} from "../../services/progressApiService";

export default function ExerciseScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { currentHearts, loseHeartOnWrongAnswer, maxHearts } = useHearts();

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
  // Remove hardcoded lives state - now using hearts from global state

  // Additional state for different question types
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedMatches, setSelectedMatches] = useState<{
    left?: string;
    right?: string;
  }>({});

  // Track exercise progress for API submission
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseAnswer[]>(
    []
  );
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(
    Date.now()
  );

  // Store detailed exercise results for displaying in results screen
  const [detailedResults, setDetailedResults] = useState<
    Array<{
      exerciseId: string;
      question: string;
      userAnswer: any;
      correctAnswer: any;
      isCorrect: boolean;
      questionFormat: string;
      options?: any[];
      answerTime: number;
    }>
  >([]);

  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // API mutation for completing lesson
  const [completeFullLesson, { isLoading: isSubmittingLesson }] =
    useCompleteFullLessonMutation();

  const correctAnswersRef = useRef(0);

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
  }, [correctAnswers]);

  useEffect(() => {
    if (currentLesson) {
      console.log("Current lesson fetched successfully:", currentLesson);
    }
  }, [currentLesson]);

  // Reset exercise start time when moving to next exercise
  useEffect(() => {
    setExerciseStartTime(Date.now());
  }, [currentExerciseIndex]);

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
    setExerciseStartTime(Date.now()); // Reset timer for new exercise
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

  // Handle match pairs change
  const handleMatchPairs = React.useCallback(
    (newPairs: { [key: string]: string }) => {
      setMatchedPairs(newPairs);
      // For match questions, we'll validate in submit
    },
    []
  );

  // Handle reorder words change
  const handleReorderWords = React.useCallback((newWords: string[]) => {
    setReorderedWords(newWords);
    setSelectedAnswer(newWords.join(" "));
  }, []);

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
          return selectedAnswer !== null && selectedAnswer.trim() !== "";
        case "reorder":
          return (
            reorderedWords.length > 0 &&
            reorderedWords.every((word) => word.trim() !== "")
          );
        case "match":
          const options = currentExercise.options as MatchOption[];
          return Object.keys(matchedPairs).length === options.length;
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
        // Calculate answer time and user answer for API submission
        const answerTimeSeconds = Math.round(
          (Date.now() - exerciseStartTime) / 1000
        );
        let userAnswerForAPI: any;

        switch (currentExercise.question_format) {
          case "multiple_choice":
          case "fill_in_blank":
          case "listening":
          case "image_select":
            userAnswerForAPI = selectedAnswer;
            break;
          case "reorder":
            userAnswerForAPI = reorderedWords.join(" ");
            break;
          case "match":
            userAnswerForAPI = matchedPairs;
            break;
          default:
            userAnswerForAPI = selectedAnswer;
        }

        loseHeartOnWrongAnswer(
          currentExercise._id,
          userAnswerForAPI || {},
          answerTimeSeconds
        );

        // Check if user has no hearts left after losing one
        if (currentHearts <= 1) {
          // <= 1 because we just lost one heart
          setTimeout(() => {
            Alert.alert(
              "Hết tim rồi! 💔",
              "Bạn đã hết tim. Bài học sẽ kết thúc và tiến độ của bạn sẽ được lưu.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // End the lesson early due to no hearts
                    handleExerciseComplete();
                  },
                },
              ],
              { cancelable: false }
            );
          }, 1000); // Give time for the UI to update the heart display
        }
      }

      // Track this exercise's answer and time for API submission
      const answerTime = Date.now() - exerciseStartTime; // Keep in milliseconds for detailed results
      const answerTimeSeconds = Math.round(answerTime / 1000); // Convert to seconds for API
      let userAnswerForAPI: any;

      switch (currentExercise.question_format) {
        case "multiple_choice":
        case "fill_in_blank":
        case "listening":
        case "image_select":
          userAnswerForAPI = selectedAnswer;
          break;
        case "reorder":
          userAnswerForAPI = reorderedWords.join(" ");
          break;
        case "match":
          userAnswerForAPI = matchedPairs;
          break;
        default:
          userAnswerForAPI = selectedAnswer;
      }

      const exerciseAnswer: ExerciseAnswer = {
        exercise_id: currentExercise._id,
        user_answer: userAnswerForAPI,
        answer_time: answerTimeSeconds, // Use seconds for API
      };

      console.log("Tracking exercise:", {
        exerciseId: currentExercise._id,
        userAnswer: userAnswerForAPI,
        answerTime: answerTimeSeconds, // Log seconds for readability
        isCorrect: isCorrect,
      });

      setExerciseProgress((prev) => [...prev, exerciseAnswer]);

      // Store detailed result for results screen
      const detailedResult = {
        exerciseId: currentExercise._id,
        question: currentExercise.question,
        userAnswer: userAnswerForAPI,
        correctAnswer: currentExercise.correct_answer,
        isCorrect: isCorrect,
        questionFormat: currentExercise.question_format,
        options: currentExercise.options,
        answerTime: answerTime, // Use milliseconds for detailed results
      };

      setDetailedResults((prev) => [...prev, detailedResult]);
    } catch (error) {
      console.error("Error validating answer:", error);
      Alert.alert("Error", "Failed to validate answer. Please try again.");

      // In case of error, still submit with available data
      const answerTimeSeconds = Math.round(
        (Date.now() - exerciseStartTime) / 1000
      );
      loseHeartOnWrongAnswer(
        currentExercise._id,
        { error: "validation_failed" },
        answerTimeSeconds
      );
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

  const handleExerciseComplete = async () => {
    const finalCorrectAnswers = correctAnswersRef.current;
    const score = Math.round((finalCorrectAnswers / totalExercises) * 100);
    const xpEarned = Math.round(
      (finalCorrectAnswers / totalExercises) * (currentLesson?.xp_reward || 10)
    );
    const perfectLesson = finalCorrectAnswers === totalExercises;
    const streakIncreased = finalCorrectAnswers / totalExercises >= 0.7;

    // Prepare API payload
    if (!user?.id && !user?._id) {
      Alert.alert("Error", "User not found. Please log in again.");
      router.push("/(tabs)/home");
      return;
    }

    const userId = (user.id || user._id) as string; // Safe cast since we checked above
    const apiPayload = {
      user_id: userId,
      lesson_id: lessonId || "",
      exercises: exerciseProgress,
    };

    try {
      // Call the API to complete the lesson
      console.log("Submitting lesson progress:", apiPayload);
      const result = await completeFullLesson(apiPayload).unwrap();
      console.log("Lesson completed successfully:", result);

      // Navigate to results with updated data
      const navigationParams = {
        lessonId: lessonId || "1",
        score: score.toString(),
        totalQuestions: totalExercises.toString(),
        correctAnswers: finalCorrectAnswers.toString(),
        xpEarned: xpEarned.toString(),
        perfectLesson: perfectLesson.toString(),
        streakIncreased: streakIncreased.toString(),
        detailedResults: JSON.stringify(detailedResults),
      };

      router.push({
        pathname: "/exercise/result",
        params: navigationParams,
      });
    } catch (error) {
      console.error("Error submitting lesson progress:", error);
      Alert.alert(
        "Error",
        "Failed to save your progress. Your answers have been recorded locally.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Still navigate to results even if API fails
              const navigationParams = {
                lessonId: lessonId || "1",
                score: score.toString(),
                totalQuestions: totalExercises.toString(),
                correctAnswers: finalCorrectAnswers.toString(),
                xpEarned: xpEarned.toString(),
                perfectLesson: perfectLesson.toString(),
                streakIncreased: streakIncreased.toString(),
                detailedResults: JSON.stringify(detailedResults),
              };

              router.push({
                pathname: "/exercise/result",
                params: navigationParams,
              });
            },
          },
        ]
      );
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
              {[...Array(maxHearts)].map((_, i) => (
                <Text key={i} style={styles.heart}>
                  {i < currentHearts ? "❤️" : "🤍"}
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
              disabled={(() => {
                switch (currentExercise?.question_format) {
                  case "multiple_choice":
                  case "fill_in_blank":
                  case "listening":
                  case "image_select":
                    return !selectedAnswer || isProcessing;
                  case "reorder":
                    return (
                      reorderedWords.length === 0 ||
                      reorderedWords.some((word) => !word.trim()) ||
                      isProcessing
                    );
                  case "match":
                    const options = currentExercise.options as MatchOption[];
                    return (
                      Object.keys(matchedPairs).length < options.length ||
                      isProcessing
                    );
                  default:
                    return !selectedAnswer || isProcessing;
                }
              })()}
              style={[
                styles.submitButton,
                (() => {
                  switch (currentExercise?.question_format) {
                    case "multiple_choice":
                    case "fill_in_blank":
                    case "listening":
                    case "image_select":
                      return (
                        (!selectedAnswer || isProcessing) &&
                        styles.disabledButton
                      );
                    case "reorder":
                      return (
                        (reorderedWords.length === 0 ||
                          reorderedWords.some((word) => !word.trim()) ||
                          isProcessing) &&
                        styles.disabledButton
                      );
                    case "match":
                      const options = currentExercise.options as MatchOption[];
                      return (
                        (Object.keys(matchedPairs).length < options.length ||
                          isProcessing) &&
                        styles.disabledButton
                      );
                    default:
                      return (
                        (!selectedAnswer || isProcessing) &&
                        styles.disabledButton
                      );
                  }
                })(),
              ].filter(Boolean)}
            />
          ) : (
            <Button
              title={
                currentExerciseIndex < totalExercises - 1
                  ? "Next"
                  : isSubmittingLesson
                  ? "Saving Progress..."
                  : "View Results"
              }
              onPress={handleNext}
              disabled={isProcessing || isSubmittingLesson}
              style={[
                styles.submitButton,
                (isProcessing || isSubmittingLesson) && styles.disabledButton,
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
