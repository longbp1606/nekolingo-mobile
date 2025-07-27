import { useCallback, useEffect, useState } from 'react';
import achievementService from '../services/achievementService';
import {
    ProcessedAchievement,
    UseAchievementsProps,
    UseAchievementsReturn
} from '../types/achievement';

export const useAchievements = ({
    userId,
    userStats
}: UseAchievementsProps): UseAchievementsReturn => {
    const [achievements, setAchievements] = useState<ProcessedAchievement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAchievements = useCallback(async () => {


        if (!userId || userId === 'null' || userId === 'undefined' || userId === null) {
            setError('User ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const processedAchievements = await achievementService.getProcessedAchievements(
                userId,
                userStats
            );
            
            setAchievements(processedAchievements);
        } catch (err) {
            console.error('❌ useAchievements - Error fetching achievements:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch achievements';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userId, userStats]);

    const refreshAchievements = useCallback(async () => {
        await fetchAchievements();
    }, [fetchAchievements]);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    return {
        achievements,
        loading,
        error,
        refreshAchievements,
    };
};