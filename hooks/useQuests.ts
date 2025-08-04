import { useCallback, useEffect, useState } from "react";
import {
  formatQuestForUI,
  FormattedQuest,
  QuestReward,
  useGetDailyQuestsQuery,
  useQuestManager,
  UserQuest,
} from "../services/questApiService";

interface UseQuestsReturn {
  quests: FormattedQuest[];
  loading: boolean;
  error: string | null;
  refreshQuests: () => void;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<QuestReward | null>;
  claimReward: (questId: string) => Promise<QuestReward | null>;
  // New quest initialization features
  isInitializing: boolean;
  questsCreated: boolean;
  initializationError: string | null;
}

interface UseQuestsOptions {
  autoInitialize?: boolean;
  onQuestsCreated?: (quests: FormattedQuest[]) => void;
  onInitializationError?: (error: any) => void;
}

export const useQuests = (options: UseQuestsOptions = {}): UseQuestsReturn => {
  const {
    autoInitialize = true,
    onQuestsCreated,
    onInitializationError,
  } = options;

  // RTK Query hooks
  const {
    data: userQuests,
    isLoading,
    error: apiError,
    refetch,
  } = useGetDailyQuestsQuery();

  // Quest initialization hook
  const { ensureQuestsExist, isLoadingQuests, isCreatingQuests } =
    useQuestManager();

  // Quest initialization state
  const [questsCreated, setQuestsCreated] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-initialize quests when component mounts (if enabled)
  useEffect(() => {
    if (autoInitialize && !hasInitialized) {
      const initializeQuests = async () => {
        try {
          console.log("🎯 Auto-initializing daily quests...");
          const result = await ensureQuestsExist();

          if (result.success) {
            setQuestsCreated(result.created);
            setInitializationError(null);

            if (result.created && onQuestsCreated) {
              const formattedQuests = result.quests.map(formatQuestForUI);
              onQuestsCreated(formattedQuests);
            }

            console.log(
              `✅ Quest initialization complete. Created: ${result.created}, Count: ${result.quests.length}`
            );
          } else {
            setInitializationError(
              result.error || "Failed to initialize quests"
            );
            if (onInitializationError) {
              onInitializationError(result.error);
            }
          }
        } catch (error) {
          console.error("❌ Quest initialization failed:", error);
          setInitializationError("Quest initialization failed");
          if (onInitializationError) {
            onInitializationError(error);
          }
        } finally {
          setHasInitialized(true);
        }
      };

      initializeQuests();
    }
  }, [
    autoInitialize,
    hasInitialized,
    ensureQuestsExist,
    onQuestsCreated,
    onInitializationError,
  ]);

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
        // TODO: Implement updateQuestProgressMutation when available
        console.log(
          `[useQuests] Update quest progress: ${questId} -> ${progress}`
        );
        // await updateQuestProgressMutation({ questId, progress }).unwrap();
      } catch (err) {
        console.error("[useQuests] Error updating quest progress:", err);
        throw err;
      }
    },
    []
  );

  const completeQuest = useCallback(
    async (questId: string): Promise<QuestReward | null> => {
      try {
        // TODO: Implement completeQuestMutation when available
        console.log(`[useQuests] Complete quest: ${questId}`);
        // const result = await completeQuestMutation(questId).unwrap();
        // return result.reward;
        return null;
      } catch (err) {
        console.error("[useQuests] Error completing quest:", err);
        return null;
      }
    },
    []
  );

  const claimReward = useCallback(
    async (questId: string): Promise<QuestReward | null> => {
      try {
        // TODO: Implement claimQuestRewardMutation when available
        console.log(`[useQuests] Claim reward: ${questId}`);
        // const result = await claimQuestRewardMutation(questId).unwrap();
        // if (result.success) {
        //   return result.reward;
        // } else {
        //   console.warn("[useQuests] Reward claim was not successful");
        //   return null;
        // }
        return null;
      } catch (err) {
        console.error("[useQuests] Error claiming reward:", err);
        return null;
      }
    },
    []
  );

  return {
    quests,
    loading: isLoading,
    error,
    refreshQuests,
    updateQuestProgress,
    completeQuest,
    claimReward,
    // New quest initialization features
    isInitializing: isLoadingQuests || isCreatingQuests,
    questsCreated,
    initializationError,
  };
};
