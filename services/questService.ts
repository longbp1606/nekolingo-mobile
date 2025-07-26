import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

interface QuestReward {
    type: 'xp' | 'gem' | 'heart';
    amount: number;
}

interface QuestDetail {
    _id: string;
    title: string;
    icon: string;
    type: 'XP' | 'Complete' | 'Time' | 'Streak';
    condition: number;
    reward: QuestReward;
}

interface UserQuest {
    _id: string;
    user_id: string;
    quest_id: QuestDetail;
    is_completed: boolean;
    progress?: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface QuestProgress {
    questId: string;
    progress: number;
    isCompleted: boolean;
}

class QuestService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return token;
        } catch (error) {
            console.error('[QuestService] Error getting token:', error);
            return null;
        }
    }

    private async getHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    ...headers,
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[QuestService] Request error:', error);
            throw error;
        }
    }

    async getDailyQuests(): Promise<UserQuest[]> {
        try {
            const data = await this.makeRequest<UserQuest[]>('/api/quest/daily');
            return data;
        } catch (error) {
            console.error('[QuestService] Error getting daily quests:', error);
            throw error;
        }
    }

    async updateQuestProgress(questId: string, progress: number): Promise<UserQuest> {
        try {
            const data = await this.makeRequest<UserQuest>(`/api/quest/${questId}/progress`, {
                method: 'PUT',
                body: JSON.stringify({ progress }),
            });
            return data;
        } catch (error) {
            console.error('[QuestService] Error updating quest progress:', error);
            throw error;
        }
    }

    async completeQuest(questId: string): Promise<{ quest: UserQuest; reward: QuestReward }> {
        try {
            const data = await this.makeRequest<{ quest: UserQuest; reward: QuestReward }>(`/api/quest/${questId}/complete`, {
                method: 'POST',
            });
            return data;
        } catch (error) {
            console.error('[QuestService] Error completing quest:', error);
            throw error;
        }
    }

    async claimQuestReward(questId: string): Promise<{ success: boolean; reward: QuestReward }> {
        try {
            const data = await this.makeRequest<{ success: boolean; reward: QuestReward }>(`/api/quest/${questId}/claim`, {
                method: 'POST',
            });
            return data;
        } catch (error) {
            console.error('[QuestService] Error claiming quest reward:', error);
            throw error;
        }
    }

    formatQuestForUI(userQuest: UserQuest) {
        const { quest_id, is_completed, progress = 0 } = userQuest;

        return {
            id: userQuest._id,
            questId: quest_id._id,
            title: quest_id.title,
            subtitle: this.getQuestSubtitle(quest_id),
            progress: Math.min(progress, quest_id.condition),
            total: quest_id.condition,
            icon: this.getQuestIcon(quest_id.type),
            isCompleted: is_completed,
            reward: quest_id.reward,
            type: quest_id.type,
        };
    }

    private getQuestSubtitle(quest: QuestDetail): string {
        switch (quest.type) {
            case 'XP':
                return `Kiếm ${quest.condition} XP`;
            case 'Complete':
                return `Hoàn thành ${quest.condition} bài học`;
            case 'Time':
                return `Học ${quest.condition} phút`;
            case 'Streak':
                return `Duy trì streak ${quest.condition} ngày`;
            default:
                return '';
        }
    }

    private getQuestIcon(type: string): string {
        switch (type) {
            case 'XP':
                return '⭐';
            case 'Complete':
                return '✅';
            case 'Time':
                return '⏰';
            case 'Streak':
                return '🔥';
            default:
                return '🎯';
        }
    }

    async checkQuestCompletion(userQuests: UserQuest[]): Promise<QuestProgress[]> {
        return userQuests.map(quest => ({
            questId: quest._id,
            progress: quest.progress || 0,
            isCompleted: quest.is_completed,
        }));
    }
}

const questServiceInstance = new QuestService();
export default questServiceInstance;
export type { QuestDetail, QuestProgress, QuestReward, UserQuest };

