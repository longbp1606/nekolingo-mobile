import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useRef, useState } from "react";
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

// Multiple Choice / Fill in Blank Exercise Component (Non-Listening)
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

// Listening Exercise Component with Audio Player
export const ListeningExercise: React.FC<BaseExerciseProps> = ({
  exercise,
  selectedAnswer,
  onAnswerSelect,
  isAnswerSubmitted,
  isProcessing,
  getAnswerStyle,
  getAnswerTextStyle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const player = useAudioPlayer(exercise.audio_url || "");
  const playerRef = useRef(player);
  const isMountedRef = useRef(true);
  const options = exercise.options as string[];

  // Update player ref when player changes
  React.useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Track component mount status
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track player readiness and reset when exercise changes
  React.useEffect(() => {
    const resetPlayer = async () => {
      if (!isMountedRef.current) return;

      try {
        setIsPlayerReady(false);
        setIsLoading(false);

        const currentPlayer = playerRef.current;
        if (currentPlayer && exercise.audio_url) {
          // Stop any current playback safely
          try {
            if (currentPlayer.playing) {
              currentPlayer.pause();
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (pauseError) {
            console.log("Player already paused or disposed");
          }

          // Reset position safely
          try {
            currentPlayer.seekTo(0);
          } catch (seekError) {
            console.log("Could not seek player");
          }

          // Wait a bit for the player to be ready
          await new Promise((resolve) => setTimeout(resolve, 200));

          if (isMountedRef.current) {
            setIsPlayerReady(true);
          }
        }
      } catch (error) {
        console.error("Error resetting player:", error);
        if (isMountedRef.current) {
          setIsPlayerReady(false);
        }
      }
    };

    resetPlayer();
  }, [exercise._id, exercise.audio_url]);

  // Cleanup when component unmounts
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Cleanup with timeout to avoid race conditions
      setTimeout(() => {
        try {
          const currentPlayer = playerRef.current;
          if (currentPlayer) {
            try {
              if (currentPlayer.playing) {
                currentPlayer.pause();
              }
            } catch (cleanupError) {
              // Player already disposed, ignore
            }
          }
        } catch (error) {
          // Ignore cleanup errors when component is unmounted
        }
      }, 100);
    };
  }, []);

  const playAudio = async (playbackRate: number = 1.0) => {
    if (!exercise.audio_url) {
      Alert.alert("Error", "No audio available for this exercise");
      return;
    }

    if (!isPlayerReady || !isMountedRef.current) {
      Alert.alert("Error", "Audio player is not ready yet. Please try again.");
      return;
    }

    const currentPlayer = playerRef.current;
    if (!currentPlayer) {
      Alert.alert("Error", "Audio player is not available");
      return;
    }

    try {
      setIsLoading(true);

      // If audio is currently playing, stop it first
      try {
        if (currentPlayer.playing) {
          currentPlayer.pause();
          // Add a small delay to ensure the pause is processed
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      } catch (pauseError) {
        console.log("Player pause issue, continuing...");
      }

      // Reset to beginning and set playback rate
      try {
        currentPlayer.seekTo(0);
        await new Promise((resolve) => setTimeout(resolve, 100));

        currentPlayer.playbackRate = playbackRate;
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Play the audio
        currentPlayer.play();
      } catch (playError) {
        throw new Error("Failed to play audio");
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio. Please try again.");
    } finally {
      // Keep loading state for a bit longer to prevent rapid button presses
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }, 300);
    }
  };

  return (
    <View>
      {/* Audio Player Section */}
      <View style={styles.audioPlayerContainer}>
        <TouchableOpacity
          style={[
            styles.playButton,
            (isLoading || !isPlayerReady) && styles.playButtonDisabled,
          ]}
          onPress={() => playAudio(1.0)}
          disabled={isLoading || !isPlayerReady}
        >
          <Ionicons
            name={(() => {
              try {
                return playerRef.current && playerRef.current.playing
                  ? "volume-high"
                  : "play";
              } catch {
                return "play";
              }
            })()}
            size={32}
            color={Colors.background}
          />
        </TouchableOpacity>
      </View>

      {/* Options */}
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
    </View>
  );
};

// Image Selection Exercise Component - Similar to web version
export const ImageOptionsExercise: React.FC<BaseExerciseProps> = ({
  exercise,
  selectedAnswer,
  onAnswerSelect,
  isAnswerSubmitted,
  isProcessing,
}) => {
  const options = exercise.options as ImageOption[];
  const correctAnswer = exercise.correct_answer as string;

  const getImageOptionStyle = (option: ImageOption, index: number) => {
    const isSelected = selectedAnswer === option.value;
    const isCorrectAnswer = option.value === correctAnswer;

    if (isAnswerSubmitted) {
      if (isCorrectAnswer) {
        return [styles.imageOption, styles.correctImageOption];
      } else if (isSelected && !isCorrectAnswer) {
        return [styles.imageOption, styles.wrongImageOption];
      } else {
        return [styles.imageOption];
      }
    } else if (isSelected) {
      return [styles.imageOption, styles.selectedImageOption];
    }

    return [styles.imageOption];
  };

  return (
    <View style={styles.imageOptionsContainer}>
      {options.map((option: ImageOption, index: number) => (
        <TouchableOpacity
          key={index}
          style={getImageOptionStyle(option, index)}
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
          <View style={styles.optionNumber}>
            <Text style={styles.optionNumberText}>{index + 1}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Reorder/Sentence Arrangement Exercise Component - Like web version with slots
interface ReorderExerciseProps extends BaseExerciseProps {
  reorderedWords: string[];
  onReorderWords: (words: string[]) => void;
}

export const ReorderExercise: React.FC<ReorderExerciseProps> = React.memo(
  ({
    exercise,
    selectedAnswer,
    onAnswerSelect,
    reorderedWords,
    onReorderWords,
    isAnswerSubmitted,
    isProcessing,
  }) => {
    const options = exercise.options as string[];
    const correctAnswer = exercise.correct_answer as string;
    const correctWords = correctAnswer.split(" ");

    // State for available words and selected slots
    const [availableWords, setAvailableWords] = useState<string[]>(options);
    const [selectedSlots, setSelectedSlots] = useState<string[]>(
      Array(correctWords.length).fill("")
    );

    // Reset state when exercise changes
    React.useEffect(() => {
      setAvailableWords(options);
      setSelectedSlots(Array(correctWords.length).fill(""));
    }, [exercise._id, options.length, correctWords.length]);

    const handleWordClick = React.useCallback(
      (word: string, index: number) => {
        if (isAnswerSubmitted || isProcessing) return;

        // Find first empty slot
        const emptySlotIndex = selectedSlots.findIndex((slot) => slot === "");

        if (emptySlotIndex !== -1) {
          // Add word to slot
          const newSlots = [...selectedSlots];
          newSlots[emptySlotIndex] = word;
          setSelectedSlots(newSlots);

          // Remove word from available words
          const newAvailable = availableWords.filter((_, i) => i !== index);
          setAvailableWords(newAvailable);

          // Update parent component
          onReorderWords(newSlots);
          onAnswerSelect(newSlots.join(" "));
        }
      },
      [
        selectedSlots,
        availableWords,
        isAnswerSubmitted,
        isProcessing,
        onReorderWords,
        onAnswerSelect,
      ]
    );

    const handleSlotClick = React.useCallback(
      (slotIndex: number) => {
        if (isAnswerSubmitted || isProcessing) return;

        const wordToRemove = selectedSlots[slotIndex];
        if (wordToRemove) {
          // Remove word from slot
          const newSlots = [...selectedSlots];
          newSlots[slotIndex] = "";
          setSelectedSlots(newSlots);

          // Add word back to available words
          setAvailableWords((prev) => [...prev, wordToRemove]);

          // Update parent component
          onReorderWords(newSlots);
          onAnswerSelect(newSlots.join(" "));
        }
      },
      [
        selectedSlots,
        isAnswerSubmitted,
        isProcessing,
        onReorderWords,
        onAnswerSelect,
      ]
    );

    const getSlotStyle = (word: string, index: number) => {
      if (isAnswerSubmitted) {
        const isCorrectWord = correctWords[index] === word;
        if (isCorrectWord) {
          return [styles.wordSlot, styles.correctSlot];
        } else if (word) {
          return [styles.wordSlot, styles.wrongSlot];
        }
      }

      return [styles.wordSlot];
    };

    return (
      <View style={styles.reorderContainer}>
        <Text style={styles.reorderInstructions}>
          Tap words to arrange them in the correct order:
        </Text>

        {/* Word slots for sentence construction */}
        <View style={styles.sentenceContainer}>
          {selectedSlots.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={getSlotStyle(word, index)}
              onPress={() => handleSlotClick(index)}
              disabled={isAnswerSubmitted || isProcessing}
            >
              <Text style={styles.slotText}>{word || "___"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Available words to choose from */}
        <View style={styles.wordsContainer}>
          {availableWords.map((word: string, index: number) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              style={styles.wordButton}
              onPress={() => handleWordClick(word, index)}
              disabled={isAnswerSubmitted || isProcessing}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
);

// Match Exercise Component - Like web version with left/right columns
interface MatchExerciseProps extends BaseExerciseProps {
  matchedPairs: { [key: string]: string };
  onMatchPairs: (pairs: { [key: string]: string }) => void;
}

export const MatchExercise: React.FC<MatchExerciseProps> = React.memo(
  ({
    exercise,
    matchedPairs,
    onMatchPairs,
    isAnswerSubmitted,
    isProcessing,
  }) => {
    const options = exercise.options as MatchOption[];
    const correctPairs = exercise.correct_answer as MatchOption[];

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);

    const handleLeftClick = React.useCallback(
      (leftText: string) => {
        if (isAnswerSubmitted || isProcessing) return;
        if (matchedPairs[leftText]) return; // Already matched

        setSelectedLeft((prev) => (prev === leftText ? null : leftText));

        if (selectedRight && leftText !== selectedLeft) {
          // Make a match - create a new object to avoid read-only issues
          const newPairs = { ...matchedPairs };
          newPairs[leftText] = selectedRight;
          onMatchPairs(newPairs);
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      },
      [
        matchedPairs,
        selectedRight,
        selectedLeft,
        isAnswerSubmitted,
        isProcessing,
        onMatchPairs,
      ]
    );

    const handleRightClick = React.useCallback(
      (rightText: string) => {
        if (isAnswerSubmitted || isProcessing) return;
        if (Object.values(matchedPairs).includes(rightText)) return; // Already matched

        setSelectedRight((prev) => (prev === rightText ? null : rightText));

        if (selectedLeft && rightText !== selectedRight) {
          // Make a match - create a new object to avoid read-only issues
          const newPairs = { ...matchedPairs };
          newPairs[selectedLeft] = rightText;
          onMatchPairs(newPairs);
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      },
      [
        matchedPairs,
        selectedLeft,
        selectedRight,
        isAnswerSubmitted,
        isProcessing,
        onMatchPairs,
      ]
    );

    const getLeftItemStyle = (leftText: string) => {
      if (matchedPairs[leftText]) {
        // Check if this is a correct match
        const isCorrect = correctPairs.some(
          (pair) =>
            pair.left === leftText && pair.right === matchedPairs[leftText]
        );

        // Show immediate feedback - no need to wait for submission
        return [
          styles.matchItem,
          isCorrect ? styles.correctMatch : styles.wrongMatch,
        ];
      } else if (selectedLeft === leftText) {
        return [styles.matchItem, styles.selectedMatch];
      }

      return [styles.matchItem];
    };

    const getRightItemStyle = (rightText: string) => {
      if (Object.values(matchedPairs).includes(rightText)) {
        // Find the left item that matches this right item
        const leftItem = Object.keys(matchedPairs).find(
          (key) => matchedPairs[key] === rightText
        );
        const isCorrect =
          leftItem &&
          correctPairs.some(
            (pair) => pair.left === leftItem && pair.right === rightText
          );

        // Show immediate feedback - no need to wait for submission
        return [
          styles.matchItem,
          isCorrect ? styles.correctMatch : styles.wrongMatch,
        ];
      } else if (selectedRight === rightText) {
        return [styles.matchItem, styles.selectedMatch];
      }

      return [styles.matchItem];
    };

    return (
      <View style={styles.matchContainer}>
        <Text style={styles.matchInstructions}>
          Match the items by tapping on them:
        </Text>

        <View style={styles.matchColumnsContainer}>
          {/* Left column */}
          <View style={styles.matchColumn}>
            {options.map((option: MatchOption) => {
              const isMatched = matchedPairs[option.left];
              const isCorrect =
                isMatched &&
                correctPairs.some(
                  (pair) =>
                    pair.left === option.left &&
                    pair.right === matchedPairs[option.left]
                );

              return (
                <TouchableOpacity
                  key={`left-${option.id}`}
                  style={getLeftItemStyle(option.left)}
                  onPress={() => handleLeftClick(option.left)}
                  disabled={isAnswerSubmitted || isProcessing}
                >
                  <View style={styles.matchItemContent}>
                    <Text style={styles.matchText}>{option.left}</Text>
                    {isMatched && (
                      <Text
                        style={[
                          styles.matchIndicator,
                          isCorrect
                            ? styles.correctIndicator
                            : styles.wrongIndicator,
                        ]}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right column - shuffled */}
          <View style={styles.matchColumn}>
            {[...options]
              .sort(() => Math.random() - 0.5) // Shuffle the right side
              .map((option: MatchOption) => {
                const isMatched = Object.values(matchedPairs).includes(
                  option.right
                );
                const leftItem = Object.keys(matchedPairs).find(
                  (key) => matchedPairs[key] === option.right
                );
                const isCorrect =
                  leftItem &&
                  correctPairs.some(
                    (pair) =>
                      pair.left === leftItem && pair.right === option.right
                  );

                return (
                  <TouchableOpacity
                    key={`right-${option.id}`}
                    style={getRightItemStyle(option.right)}
                    onPress={() => handleRightClick(option.right)}
                    disabled={isAnswerSubmitted || isProcessing}
                  >
                    <View style={styles.matchItemContent}>
                      <Text style={styles.matchText}>{option.right}</Text>
                      {isMatched && (
                        <Text
                          style={[
                            styles.matchIndicator,
                            isCorrect
                              ? styles.correctIndicator
                              : styles.wrongIndicator,
                          ]}
                        >
                          {isCorrect ? "✓" : "✗"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  optionsContainer: {
    gap: Sizes.md,
    marginBottom: Sizes.lg,
  },

  // Image options styles
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
    position: "relative",
  },
  selectedImageOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  correctImageOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  wrongImageOption: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + "10",
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
    fontWeight: "500",
  },
  optionNumber: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionNumberText: {
    color: Colors.background,
    fontSize: Sizes.caption,
    fontWeight: "bold",
  },

  // Audio player styles for listening exercises
  audioPlayerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Sizes.xl,
    gap: Sizes.md,
  },
  playButton: {
    backgroundColor: Colors.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },

  // Reorder exercise styles
  reorderContainer: {
    marginVertical: Sizes.md,
  },
  reorderInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.md,
    textAlign: "center",
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Sizes.md,
    minHeight: 60,
    alignItems: "center",
  },
  wordSlot: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: "center",
  },
  correctSlot: {
    borderBottomColor: Colors.success,
  },
  wrongSlot: {
    borderBottomColor: Colors.error,
  },
  slotText: {
    fontSize: Sizes.body,
    color: Colors.text,
    textAlign: "center",
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: Sizes.md,
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

  // Match exercise styles
  matchContainer: {
    marginVertical: Sizes.md,
  },
  matchInstructions: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.md,
    textAlign: "center",
  },
  matchColumnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Sizes.md,
  },
  matchColumn: {
    flex: 1,
    gap: Sizes.sm,
  },
  matchItem: {
    flex: 1,
    padding: Sizes.md,
    borderRadius: Sizes.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  matchedItem: {
    borderColor: Colors.textLight,
    backgroundColor: Colors.background,
  },
  selectedMatch: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  correctMatch: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "15",
    borderWidth: 3,
    shadowColor: Colors.success,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wrongMatch: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + "15",
    borderWidth: 3,
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchText: {
    fontSize: Sizes.body,
    color: Colors.text,
    textAlign: "center",
  },
  matchItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  matchIndicator: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: Sizes.xs,
  },
  correctIndicator: {
    color: Colors.success,
  },
  wrongIndicator: {
    color: Colors.error,
  },
});
