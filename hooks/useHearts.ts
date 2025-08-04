import { useEffect } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../config/store";
import { loseHeart, syncHeartsFromUser } from "../services/heartSlice";
import { useSubmitExerciseMutation } from "../services/progressApiService";

export const useHearts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const heartState = useSelector((state: RootState) => state.hearts);
  const [submitExercise] = useSubmitExerciseMutation();

  // Sync hearts from user profile when user data changes
  useEffect(() => {
    if (user?.hearts !== undefined) {
      dispatch(syncHeartsFromUser(user.hearts));
    }
  }, [user?.hearts, dispatch]);

  // Get current heart count (prioritize user profile data, fallback to local state)
  const currentHearts =
    user?.hearts !== undefined ? user.hearts : heartState.hearts;

  const checkCanStartExercise = (): boolean => {
    return currentHearts > 0;
  };

  const handleHeartCheck = (onCanStart: () => void): void => {
    if (checkCanStartExercise()) {
      onCanStart();
    } else {
      Alert.alert(
        "Hết tim rồi! 💔",
        "Bạn đã hết tim. Vui lòng quay lại sau hoặc mua thêm tim để tiếp tục học.",
        [
          {
            text: "OK",
            style: "default",
          },
          {
            text: "Mua tim",
            style: "default",
            onPress: () => {
              // TODO: Navigate to shop or heart purchase screen
              console.log("Navigate to heart purchase");
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const loseHeartOnWrongAnswer = async (
    exerciseId: string,
    userAnswer: object,
    answerTime: number
  ): Promise<void> => {
    if (!user?.id) {
      console.warn("No user ID available for heart submission");
      return;
    }

    dispatch(loseHeart());
    const newHeartCount = Math.max(0, currentHearts - 1);
    console.log(`Heart lost! New count: ${newHeartCount}`);

    // Submit exercise to backend to handle heart deduction
    try {
      await submitExercise({
        user_id: user.id,
        exercise_id: exerciseId,
        user_answer: userAnswer,
        answer_time: answerTime,
      }).unwrap();
      console.log("Exercise submitted successfully, heart deducted on backend");
    } catch (error) {
      console.warn("Failed to submit exercise to backend:", error);
      // App continues to work even if submission fails
    }
  };

  return {
    currentHearts,
    maxHearts: heartState.maxHearts,
    checkCanStartExercise,
    handleHeartCheck,
    loseHeartOnWrongAnswer,
    hasHearts: currentHearts > 0,
  };
};
