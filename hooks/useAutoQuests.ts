import { useEffect } from "react";
import { useLoginQuestHandler } from "./useLoginQuestHandler";

interface UseAutoQuestOptions {
  enabled?: boolean;
  skipIfExists?: boolean;
  onSuccess?: (quests: any[], created: boolean) => void;
  onError?: (error: any) => void;
}

/**
 * Hook to automatically ensure daily quests exist after user authentication.
 * Use this in your main app component or any component that needs to ensure quests are loaded.
 */
export const useAutoQuests = (options: UseAutoQuestOptions = {}) => {
  const { enabled = true, skipIfExists = true, onSuccess, onError } = options;

  const { autoHandleOnLogin, isLoading, result } = useLoginQuestHandler();

  useEffect(() => {
    if (enabled) {
      const handleQuests = async () => {
        try {
          await autoHandleOnLogin();

          if (result?.success && onSuccess) {
            onSuccess(result.quests, result.created);
          } else if (!result?.success && onError && result?.error) {
            onError(result.error);
          }
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      };

      handleQuests();
    }
  }, [enabled, autoHandleOnLogin, onSuccess, onError, result]);

  return {
    isLoading,
    quests: result?.quests || [],
    questsCreated: result?.created || false,
    error: result?.error,
    success: result?.success || false,
  };
};

/**
 * Simple hook for components that just need to trigger quest initialization
 * without automatic effect. Useful for manual triggering.
 */
export const useManualQuests = () => {
  const { handleLoginQuests, isLoading, result } = useLoginQuestHandler();

  const ensureQuests = async () => {
    return await handleLoginQuests();
  };

  return {
    ensureQuests,
    isLoading,
    quests: result?.quests || [],
    questsCreated: result?.created || false,
    error: result?.error,
    success: result?.success || false,
  };
};
