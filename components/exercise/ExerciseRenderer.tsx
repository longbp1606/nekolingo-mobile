import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Sizes } from "../../constants";
import {
  Exercise,
  ImageOptionsExercise,
  ListeningExercise,
  MatchExercise,
  ReorderExercise,
  TextOptionsExercise,
} from "./ExerciseTypes";

interface ExerciseRendererProps {
  exercise: Exercise;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  isAnswerSubmitted: boolean;
  isProcessing: boolean;
  getAnswerStyle: (answer: string) => any[];
  getAnswerTextStyle: (answer: string) => any[];

  // Additional props for specific exercise types
  reorderedWords: string[];
  onReorderWords: (words: string[]) => void;
  matchedPairs: { [key: string]: string };
  onMatchPairs: (pairs: { [key: string]: string }) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  selectedAnswer,
  onAnswerSelect,
  isAnswerSubmitted,
  isProcessing,
  getAnswerStyle,
  getAnswerTextStyle,
  reorderedWords,
  onReorderWords,
  matchedPairs,
  onMatchPairs,
}) => {
  if (!exercise?.options) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No exercise options available</Text>
      </View>
    );
  }

  try {
    switch (exercise.question_format) {
      case "multiple_choice":
      case "fill_in_blank":
        return (
          <TextOptionsExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
          />
        );

      case "listening":
        return (
          <ListeningExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
          />
        );

      case "image_select":
        return (
          <ImageOptionsExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
          />
        );

      case "reorder":
        return (
          <ReorderExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
            reorderedWords={reorderedWords}
            onReorderWords={onReorderWords}
          />
        );

      case "match":
        return (
          <MatchExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
            matchedPairs={matchedPairs}
            onMatchPairs={onMatchPairs}
          />
        );

      default:
        console.warn("Unknown exercise format:", exercise.question_format);
        // Fallback to text options
        return (
          <TextOptionsExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
            isAnswerSubmitted={isAnswerSubmitted}
            isProcessing={isProcessing}
            getAnswerStyle={getAnswerStyle}
            getAnswerTextStyle={getAnswerTextStyle}
          />
        );
    }
  } catch (error) {
    console.error("Error rendering exercise:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading exercise. Please try again.
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    padding: Sizes.lg,
    backgroundColor: Colors.error + "10",
    borderRadius: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    marginBottom: Sizes.lg,
  },
  errorText: {
    fontSize: Sizes.body,
    color: Colors.error,
    textAlign: "center",
    fontWeight: "500",
  },
});
