import { useCallback, useEffect, useState } from 'react';
import QuestService from '../services/questService';
import { FormattedQuest, QuestReward } from '../types/quest';

interface UseQuestsReturn {
    quests: FormattedQuest[];
    loading: boolean;
    error: string | null;
    refreshQuests: () => Promise<void>;
    updateQuestProgress: (questId: string, progress: number) => Promise<void>;
    completeQuest: (questId: string) => Promise<QuestReward | null>;
    claimReward: (questId: string) => Promise<QuestReward | null>;
}

export const useQuests = (): UseQuestsReturn => {
    const [quests, setQuests] = useState<FormattedQuest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userQuests = await QuestService.getDailyQuests();
            
            if (!userQuests || userQuests.length === 0) {
                setQuests([]);
                return;
            }
            
            const formattedQuests = userQuests.map((quest, index) => {
                try {
                    return QuestService.formatQuestForUI(quest);
                } catch (formatError) {
                    console.error(`[useQuests] Error formatting quest ${quest._id}:`, formatError);
                    throw new Error(`Lỗi xử lý dữ liệu nhiệm vụ: ${formatError instanceof Error ? formatError.message : 'Unknown error'}`);
                }
            });
            
            setQuests(formattedQuests);
        } catch (err) {
            console.error('[useQuests] Error in fetchQuests:', err);
            
            let errorMessage = 'Không thể tải nhiệm vụ';
            
            if (err instanceof Error) {
                if (err.message.includes('Server đang gặp sự cố') || 
                    err.message.includes('Phiên đăng nhập') ||
                    err.message.includes('Không tìm thấy') ||
                    err.message.includes('Không thể kết nối') ||
                    err.message.includes('Lỗi xử lý dữ liệu')) {
                    errorMessage = err.message;
                } else {
                    errorMessage = `Không thể tải nhiệm vụ: ${err.message}`;
                }
            }
            
            setError(errorMessage);
            console.error('[useQuests] Error details:', {
                message: errorMessage,
                originalError: err,
                stack: err instanceof Error ? err.stack : 'No stack trace'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshQuests = useCallback(async () => {
        await fetchQuests();
    }, [fetchQuests]);

    const updateQuestProgress = useCallback(async (questId: string, progress: number) => {
        try {
            
            const updatedQuest = await QuestService.updateQuestProgress(questId, progress);
            
            const formattedQuest = QuestService.formatQuestForUI(updatedQuest);
            
            setQuests(prevQuests => {
                const newQuests = prevQuests.map(quest => {
                    if (quest.id === questId) {
                        return formattedQuest;
                    }
                    return quest;
                });
                return newQuests;
            });
            
        } catch (err) {
            console.error('[useQuests] Error updating quest progress:', err);
            console.error('[useQuests] Update error details:', {
                questId,
                progress,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            throw err;
        }
    }, []);

    const completeQuest = useCallback(async (questId: string): Promise<QuestReward | null> => {
        try {
            
            const result = await QuestService.completeQuest(questId);
            
            const formattedQuest = QuestService.formatQuestForUI(result.quest);
            
            setQuests(prevQuests => {
                const newQuests = prevQuests.map(quest => {
                    if (quest.id === questId) {
                        return formattedQuest;
                    }
                    return quest;
                });
                return newQuests;
            });
            
            return result.reward;
        } catch (err) {
            console.error('[useQuests] Error completing quest:', err);
            console.error('[useQuests] Completion error details:', {
                questId,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            return null;
        }
    }, []);

    const claimReward = useCallback(async (questId: string): Promise<QuestReward | null> => {
        try {
            
            const result = await QuestService.claimQuestReward(questId);
            
            if (result.success) {
                await refreshQuests();
                return result.reward;
            } else {
                console.warn('[useQuests] Reward claim was not successful');
                return null;
            }
        } catch (err) {
            console.error('[useQuests] Error claiming reward:', err);
            console.error('[useQuests] Claim error details:', {
                questId,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            return null;
        }
    }, [refreshQuests]);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

    useEffect(() => {
    }, [quests, loading, error]);

    return {
        quests,
        loading,
        error,
        refreshQuests,
        updateQuestProgress,
        completeQuest,
        claimReward,
    };
};