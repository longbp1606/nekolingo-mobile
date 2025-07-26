export interface QuestReward {
    type: 'xp' | 'gem' | 'heart';
    amount: number;
}

export interface QuestDetail {
    _id: string;
    title: string;
    icon: string;
    type: 'XP' | 'Complete' | 'Time' | 'Streak';
    condition: number;
    reward: QuestReward;
}

export interface UserQuest {
    _id: string;
    user_id: string;
    quest_id: QuestDetail;
    is_completed: boolean;
    progress?: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface QuestProgress {
    questId: string;
    progress: number;
    isCompleted: boolean;
}

export interface FormattedQuest {
    id: string;
    questId: string;
    title: string;
    subtitle: string;
    progress: number;
    total: number;
    icon: string;
    isCompleted: boolean;
    reward: QuestReward;
    type: string;
}

export interface QuestCompletionResponse {
    quest: UserQuest;
    reward: QuestReward;
}

export interface QuestClaimResponse {
    success: boolean;
    reward: QuestReward;
}