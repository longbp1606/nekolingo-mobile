import { useCallback } from "react";
import {
  ProcessedAchievement as ApiProcessedAchievement,
  processAchievementForUI,
  useGetProcessedAchievementsQuery,
  useGetUserAchievementsQuery,
} from "../services/achievementApiService";
import {
  ProcessedAchievement,
  UseAchievementsProps,
  UseAchievementsReturn,
} from "../types/achievement";

// Helper function to convert API achievement to local type
const convertApiAchievementToLocal = (
  apiAchievement: ApiProcessedAchievement
): ProcessedAchievement => {
  const percentage = apiAchievement.isCompleted
    ? 100
    : Math.min((apiAchievement.progress / apiAchievement.total) * 100, 100);

  return {
    id: apiAchievement.id,
    level: apiAchievement.isCompleted ? "completed" : "in-progress",
    className: apiAchievement.isCompleted
      ? "achievement-completed"
      : "achievement-progress",
    icon: apiAchievement.icon,
    name: apiAchievement.name,
    progressText: `${apiAchievement.progress}/${apiAchievement.total}`,
    percentage,
    desc: apiAchievement.description,
    isUnlocked: apiAchievement.isCompleted,
    unlockDate: apiAchievement.completedAt,
    condition: {
      type: apiAchievement.type,
      value: apiAchievement.total,
    },
  };
};

export const useAchievements = ({
  userId,
  userStats,
}: UseAchievementsProps): UseAchievementsReturn => {
  // Try processed achievements first, fall back to user achievements
  const {
    data: processedData,
    isLoading: isLoadingProcessed,
    error: processedError,
    refetch: refetchProcessed,
  } = useGetProcessedAchievementsQuery(undefined, {
    skip:
      !userId || userId === "null" || userId === "undefined" || userId === null,
  });

  const {
    data: userAchievements,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useGetUserAchievementsQuery(undefined, {
    skip:
      !!processedData ||
      !userId ||
      userId === "null" ||
      userId === "undefined" ||
      userId === null,
  });

  // Process the data
  const achievements: ProcessedAchievement[] = (() => {
    if (processedData) {
      return processedData.map(convertApiAchievementToLocal);
    } else if (userAchievements) {
      return userAchievements.map((userAchievement) =>
        convertApiAchievementToLocal(processAchievementForUI(userAchievement))
      );
    }
    return [];
  })();

  // Handle loading state
  const loading = isLoadingProcessed || isLoadingUser;

  // Handle error state
  const error = (() => {
    if (
      !userId ||
      userId === "null" ||
      userId === "undefined" ||
      userId === null
    ) {
      return null;
    }

    const apiError = processedError || userError;
    if (apiError) {
      return apiError && "data" in apiError
        ? String(apiError.data)
        : "Failed to fetch achievements";
    }
    return null;
  })();

  const refreshAchievements = useCallback(async () => {
    if (processedData) {
      refetchProcessed();
    } else {
      refetchUser();
    }
  }, [processedData, refetchProcessed, refetchUser]);

  return {
    achievements,
    loading,
    error,
    refreshAchievements,
  };
};
