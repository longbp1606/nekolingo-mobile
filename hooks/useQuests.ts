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
            const formattedQuests = userQuests.map(quest => 
                QuestService.formatQuestForUI(quest)
            );
            
            setQuests(formattedQuests);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải nhiệm vụ';
            setError(errorMessage);
            console.error('[useQuests] Error fetching quests:', err);
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
            
            setQuests(prevQuests => 
                prevQuests.map(quest => 
                    quest.id === questId ? formattedQuest : quest
                )
            );
        } catch (err) {
            console.error('[useQuests] Error updating quest progress:', err);
            throw err;
        }
    }, []);

    const completeQuest = useCallback(async (questId: string): Promise<QuestReward | null> => {
        try {
            const result = await QuestService.completeQuest(questId);
            const formattedQuest = QuestService.formatQuestForUI(result.quest);
            
            setQuests(prevQuests => 
                prevQuests.map(quest => 
                    quest.id === questId ? formattedQuest : quest
                )
            );
            
            return result.reward;
        } catch (err) {
            console.error('[useQuests] Error completing quest:', err);
            return null;
        }
    }, []);

    const claimReward = useCallback(async (questId: string): Promise<QuestReward | null> => {
        try {
            const result = await QuestService.claimQuestReward(questId);
            
            if (result.success) {
                await refreshQuests();
                return result.reward;
            }
            
            return null;
        } catch (err) {
            console.error('[useQuests] Error claiming reward:', err);
            return null;
        }
    }, [refreshQuests]);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

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