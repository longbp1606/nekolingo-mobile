import { useCallback, useEffect, useState } from 'react';
import achievementService from '../services/achievementService';

interface ProcessedAchievement {
    id: string;
    level: string;
    className: string;
    icon: any;
    name: string;
    progressText: string;
    percentage: number;
    desc: string;
    isUnlocked: boolean;
    unlockDate?: string;
    condition: {
        type: string;
        value?: number;
    };
}

interface UseAchievementsProps {
    userId?: string;
    userStats?: {
        xp?: number;
        completed_lessons?: number;
        completed_courses?: number;
        has_practiced?: boolean;
        streak_days?: number;
        perfect_lessons?: number;
    };
}

interface UseAchievementsReturn {
    achievements: ProcessedAchievement[];
    loading: boolean;
    error: string | null;
    refreshAchievements: () => Promise<void>;
}

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
            console.error('❌ Error fetching achievements:', err);
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