import { useCallback } from "react";
import {
  formatQuestForUI,
  FormattedQuest,
  QuestReward,
  useClaimQuestRewardMutation,
  useCompleteQuestMutation,
  useGetDailyQuestsQuery,
  UserQuest,
  useUpdateQuestProgressMutation,
} from "../services/questApiService";

interface UseQuestsReturn {
  quests: FormattedQuest[];
  loading: boolean;
  error: string | null;
  refreshQuests: () => void;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<QuestReward | null>;
  claimReward: (questId: string) => Promise<QuestReward | null>;
}

export const useQuests = (): UseQuestsReturn => {
  // RTK Query hooks
  const {
    data: userQuests,
    isLoading,
    error: apiError,
    refetch,
  } = useGetDailyQuestsQuery();

  const [updateQuestProgressMutation] = useUpdateQuestProgressMutation();
  const [completeQuestMutation] = useCompleteQuestMutation();
  const [claimQuestRewardMutation] = useClaimQuestRewardMutation();

  // Transform data for UI
  const quests: FormattedQuest[] = userQuests
    ? userQuests.map((quest: UserQuest) => formatQuestForUI(quest))
    : [];

  // Error handling
  const error = apiError
    ? apiError && "data" in apiError
      ? String(apiError.data)
      : "Không thể tải nhiệm vụ"
    : null;

  const refreshQuests = useCallback(() => {
    refetch();
  }, [refetch]);

  const updateQuestProgress = useCallback(
    async (questId: string, progress: number) => {
      try {
        await updateQuestProgressMutation({ questId, progress }).unwrap();
      } catch (err) {
        console.error("[useQuests] Error updating quest progress:", err);
        throw err;
      }
    },
    [updateQuestProgressMutation]
  );

  const completeQuest = useCallback(
    async (questId: string): Promise<QuestReward | null> => {
      try {
        const result = await completeQuestMutation(questId).unwrap();
        return result.reward;
      } catch (err) {
        console.error("[useQuests] Error completing quest:", err);
        return null;
      }
    },
    [completeQuestMutation]
  );

  const claimReward = useCallback(
    async (questId: string): Promise<QuestReward | null> => {
      try {
        const result = await claimQuestRewardMutation(questId).unwrap();
        if (result.success) {
          return result.reward;
        } else {
          console.warn("[useQuests] Reward claim was not successful");
          return null;
        }
      } catch (err) {
        console.error("[useQuests] Error claiming reward:", err);
        return null;
      }
    },
    [claimQuestRewardMutation]
  );

  return {
    quests,
    loading: isLoading,
    error,
    refreshQuests,
    updateQuestProgress,
    completeQuest,
    claimReward,
  };
};
