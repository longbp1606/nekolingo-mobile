import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Sizes } from "../../constants";

// Define types for different exercise formats
export interface ImageOption {
  image: string;
  value: string;
}

export interface MatchOption {
  id: string;
  left: string;
  right: string;
}

export interface Exercise {
  _id: string;
  question_format:
    | "fill_in_blank"
    | "multiple_choice"
    | "reorder"
    | "image_select"
    | "listening"
    | "match";
  type: string;
  question: string;
  options: string[] | ImageOption[] | MatchOption[];
  correct_answer: string | string[] | MatchOption[];
  audio_url?: string;
}

interface BaseExerciseProps {
  exercise: Exercise;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  isAnswerSubmitted: boolean;
  isProcessing: boolean;
  getAnswerStyle: (answer: string) => any[];
  getAnswerTextStyle: (answer: string) => any[];
}

// Multiple Choice / Fill in Blank / Listening Exercise Component
export const TextOptionsExercise: React.FC<BaseExerciseProps> = ({
  exercise,
  selectedAnswer,
  onAnswerSelect,
  isAnswerSubmitted,
  isProcessing,
  getAnswerStyle,
  getAnswerTextStyle,
}) => {
  const options = exercise.options as string[];

  return (
    <View style={styles.optionsContainer}>
      {options.map((option: string, index: number) => (
        <TouchableOpacity
          key={index}
          style={getAnswerStyle(option)}
          onPress={() => onAnswerSelect(option)}
          disabled={isAnswerSubmitted || isProcessing}
        >
          <Text style={getAnswerTextStyle(option)}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Image Selection Exercise Component
export const ImageOptionsExercise: React.FC<BaseExerciseProps> = ({
  exercise,
  selectedAnswer,
  onAnswerSelect,
  isAnswerSubmitted,
  isProcessing,
}) => {
  const options = exercise.options as ImageOption[];

  return (
    <View style={styles.imageOptionsContainer}>
      {options.map((option: ImageOption, index: number) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.imageOption,
            selectedAnswer === option.value && styles.selectedImageOption,
          ]}
          onPress={() => onAnswerSelect(option.value)}
          disabled={isAnswerSubmitted || isProcessing}
        >
          <Image
            source={{ uri: option.image }}
            style={styles.optionImage}
            onError={(error) => {
              console.error("Image load error:", error.nativeEvent.error);
            }}
          />
          <Text style={styles.imageOptionText}>{option.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Reorder/Sentence Arrangement Exercise Component
interface ReorderExerciseProps extends BaseExerciseProps {
  reorderedWords: string[];
  onReorderWords: (words: string[]) => void;
}

export const ReorderExercise: React.FC<ReorderExerciseProps> = ({
  exercise,
  reorderedWords,
  onReorderWords,
  isAnswerSubmitted,
  isProcessing,
}) => {
  const handleWordTap = (index: number) => {
    if (isAnswerSubmitted || isProcessing) return;

    try {
      // Simple reorder logic - move clicked word to end
      const newWords = [...reorderedWords];
      const clickedWord = newWords.splice(index, 1)[0];
      newWords.push(clickedWord);
      onReorderWords(newWords);
    } catch (error) {
      console.error("Error reordering words:", error);
      Alert.alert("Error", "Failed to reorder words. Please try again.");
    }
  };

  return (
    <View style={styles.reorderContainer}>
      <Text style={styles.reorderInstructions}>
        Tap words to arrange them in the correct order:
      </Text>

      <View style={styles.wordsContainer}>
        {reorderedWords.map((word: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.wordButton,
              isAnswerSubmitted && styles.disabledWordButton,
            ]}
            onPress={() => handleWordTap(index)}
            disabled={isAnswerSubmitted || isProcessing}
          >
            <Text
              style={[
                styles.wordText,
                isAnswerSubmitted && styles.disabledWordText,
              ]}
            >
              {word}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sentencePreview}>
        <Text style={styles.sentenceLabel}>Your answer:</Text>
        <Text style={styles.sentenceText}>{reorderedWords.join(" ")}</Text>
      </View>
    </View>
  );
};

// Match Exercise Component
interface MatchExerciseProps extends BaseExerciseProps {
  matchedPairs: { [key: string]: string };
  onMatchPairs: (pairs: { [key: string]: string }) => void;
}

export const MatchExercise: React.FC<MatchExerciseProps> = ({
  exercise,
  matchedPairs,
  onMatchPairs,
  isAnswerSubmitted,
  isProcessing,
}) => {
  const options = exercise.options as MatchOption[];

  const handlePairMatch = (leftItem: string, rightItem: string) => {
    if (isAnswerSubmitted || isProcessing) return;

    try {
      const newPairs = { ...matchedPairs };
      newPairs[leftItem] = rightItem;
      onMatchPairs(newPairs);
    } catch (error) {
      console.error("Error matching pairs:", error);
      Alert.alert("Error", "Failed to match items. Please try again.");
    }
  };

  return (
    <View style={styles.matchContainer}>
      <Text style={styles.matchInstructions}>
        Match the items by tapping pairs:
      </Text>

      <View style={styles.matchPairsContainer}>
        {options.map((option: MatchOption) => (
          <View key={option.id} style={styles.matchPair}>
            <TouchableOpacity
              style={[
                styles.matchItem,
                styles.matchLeft,
                matchedPairs[option.left] && styles.matchedItem,
              ]}
              onPress={() => handlePairMatch(option.left, option.right)}
              disabled={isAnswerSubmitted || isProcessing}
            >
              <Text style={styles.matchText}>{option.left}</Text>
            </TouchableOpacity>

            <View style={styles.matchArrowContainer}>
              <Text style={styles.matchArrow}>
                {matchedPairs[option.left] === option.right ? "✓" : "→"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.matchItem,
                styles.matchRight,
                matchedPairs[option.left] === option.right &&
                  styles.matchedItem,
              ]}
              onPress={() => handlePairMatch(option.left, option.right)}
              disabled={isAnswerSubmitted || isProcessing}
            >
              <Text style={styles.matchText}>{option.right}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    gap: Sizes.md,
    marginBottom: Sizes.lg,
  },

  // Image Options Styles
  imageOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Sizes.md,
    marginBottom: Sizes.lg,
    justifyContent: "space-between",
  },
  imageOption: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    alignItems: "center",
    width: "48%",
    minHeight: 120,
  },
  selectedImageOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  optionImage: {
    width: 80,
    height: 60,
    borderRadius: Sizes.xs,
    marginBottom: Sizes.sm,
  },
  imageOptionText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "500",
    textAlign: "center",
  },

  // Reorder Styles
  reorderContainer: {
    marginBottom: Sizes.lg,
  },
  reorderInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Sizes.md,
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Sizes.sm,
    marginBottom: Sizes.lg,
    justifyContent: "center",
  },
  wordButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledWordButton: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  wordText: {
    color: Colors.background,
    fontSize: Sizes.body,
    fontWeight: "500",
  },
  disabledWordText: {
    color: Colors.textLight,
  },
  sentencePreview: {
    backgroundColor: Colors.card,
    padding: Sizes.md,
    borderRadius: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sentenceLabel: {
    fontSize: Sizes.caption,
    color: Colors.textLight,
    marginBottom: Sizes.xs,
  },
  sentenceText: {
    fontSize: Sizes.h4,
    color: Colors.textDark,
    fontWeight: "500",
    textAlign: "center",
  },

  // Match Styles
  matchContainer: {
    marginBottom: Sizes.lg,
  },
  matchInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Sizes.md,
  },
  matchPairsContainer: {
    gap: Sizes.md,
  },
  matchPair: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchItem: {
    flex: 1,
    padding: Sizes.sm,
    borderRadius: Sizes.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  matchLeft: {
    marginRight: Sizes.sm,
  },
  matchRight: {
    marginLeft: Sizes.sm,
  },
  matchedItem: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  matchText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    fontWeight: "500",
    textAlign: "center",
  },
  matchArrowContainer: {
    paddingHorizontal: Sizes.sm,
  },
  matchArrow: {
    fontSize: Sizes.h4,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
