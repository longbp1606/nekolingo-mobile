import { useState } from "react";
import { useQuestManager } from "../services/questApiService";

interface LoginQuestResult {
  success: boolean;
  quests: any[];
  created: boolean;
  error?: any;
}

export const useLoginQuestHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<LoginQuestResult | null>(null);
  const { ensureQuestsExist, isLoadingQuests, isCreatingQuests } =
    useQuestManager();

  const handleLoginQuests = async (
    skipIfAlreadyProcessed: boolean = false
  ): Promise<LoginQuestResult> => {
    if (skipIfAlreadyProcessed && result) {
      console.log("Quest initialization already processed, skipping...");
      return result;
    }

    setIsProcessing(true);

    try {
      console.log("Starting login quest handler...");
      const questResult = await ensureQuestsExist();

      const finalResult: LoginQuestResult = {
        success: questResult.success,
        quests: questResult.quests,
        created: questResult.created,
        error: questResult.error,
      };

      setResult(finalResult);

      if (questResult.success) {
        if (questResult.created) {
          console.log(
            `✅ Successfully created ${questResult.quests.length} daily quests for user`
          );
        } else {
          console.log(
            `✅ User already has ${questResult.quests.length} daily quests`
          );
        }
      } else {
        console.error("❌ Failed to handle login quests:", questResult.error);
      }

      return finalResult;
    } catch (error) {
      console.error("❌ Login quest handler error:", error);
      const errorResult: LoginQuestResult = {
        success: false,
        quests: [],
        created: false,
        error,
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-trigger on mount (for login scenarios)
  const autoHandleOnLogin = async () => {
    await handleLoginQuests(true); // Skip if already processed
  };

  const isLoading = isProcessing || isLoadingQuests || isCreatingQuests;

  return {
    handleLoginQuests,
    autoHandleOnLogin,
    isLoading,
    result,
    isProcessing,
  };
};
