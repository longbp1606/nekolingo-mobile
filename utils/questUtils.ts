import { QuestReward } from '../types/quest';

export class QuestUtils {

    static formatRewardText(reward: QuestReward): string {
        switch (reward.type) {
            case 'xp':
                return `${reward.amount} XP`;
            case 'gem':
                return `${reward.amount} Gem`;
            case 'heart':
                return `${reward.amount} Tim`;
            default:
                return `${reward.amount} điểm`;
        }
    }

 
    static getRewardIcon(rewardType: string): string {
        switch (rewardType) {
            case 'xp':
                return '⭐';
            case 'gem':
                return '💎';
            case 'heart':
                return '❤️';
            default:
                return '🎁';
        }
    }


    static getProgressPercentage(progress: number, total: number): number {
        if (total === 0) return 0;
        return Math.min((progress / total) * 100, 100);
    }

    static canCompleteQuest(progress: number, total: number): boolean {
        return progress >= total;
    }


    static formatTimeRemaining(hours: number): string {
        if (hours <= 0) return 'HẾT HẠN';
        if (hours === 1) return 'CÒN 1 TIẾNG';
        return `CÒN ${hours} TIẾNG`;
    }


    static getQuestTypeDisplayName(type: string): string {
        switch (type) {
            case 'XP':
                return 'Kiếm XP';
            case 'Complete':
                return 'Hoàn thành bài học';
            case 'Time':
                return 'Thời gian học';
            case 'Streak':
                return 'Duy trì streak';
            default:
                return 'Nhiệm vụ';
        }
    }


    static sortQuestsByPriority(quests: any[]): any[] {
        return quests.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }

            return b.reward.amount - a.reward.amount;
        });
    }

    static calculateTotalRewards(quests: any[]): { xp: number; gem: number; heart: number } {
        return quests.reduce(
            (total, quest) => {
                const { type, amount } = quest.reward;
                if (type in total) {
                    total[type as keyof typeof total] += amount;
                }
                return total;
            },
            { xp: 0, gem: 0, heart: 0 }
        );
    }

    static getCompletionStatusText(progress: number, total: number, isCompleted: boolean): string {
        if (isCompleted) {
            return 'Hoàn thành';
        }

        if (progress >= total) {
            return 'Sẵn sàng nhận thưởng';
        }

        return `${progress}/${total}`;
    }
}