import { FormattedQuest, QuestReward } from '../types/quest';

export class QuestUtils {

    static formatRewardText(reward: QuestReward): string {
        
        let text = '';
        switch (reward.type) {
            case 'xp':
                text = `${reward.amount} XP`;
                break;
            case 'gem':
                text = `${reward.amount} Gem`;
                break;
            case 'heart':
                text = `${reward.amount} Tim`;
                break;
            case 'freeze':
                text = `${reward.amount} Streak Freeze`;
                break;
            default:
                text = `${reward.amount} điểm`;
        }

        return text;
    }

    static getRewardIcon(rewardType: string): string {
        
        let icon = '';
        switch (rewardType) {
            case 'xp':
                icon = '⭐';
                break;
            case 'gem':
                icon = '💎';
                break;
            case 'heart':
                icon = '❤️';
                break;
            case 'freeze':
                icon = '🧊';
                break;
            default:
                icon = '🎁';
        }

        return icon;
    }

    static getProgressPercentage(progress: number, total: number): number {
        if (total === 0) {
            return 0;
        }
        
        const percentage = Math.min((progress / total) * 100, 100);
        return percentage;
    }

    static canCompleteQuest(progress: number, total: number): boolean {
        const canComplete = progress >= total;
        return canComplete;
    }

    static formatTimeRemaining(hours: number): string {
        
        let text = '';
        if (hours <= 0) {
            text = 'HẾT HẠN';
        } else if (hours === 1) {
            text = 'CÒN 1 TIẾNG';
        } else {
            text = `CÒN ${hours} TIẾNG`;
        }

        return text;
    }

    static getQuestTypeDisplayName(type: string): string {
        
        let displayName = '';
        switch (type) {
            case 'XP':
                displayName = 'Kiếm XP';
                break;
            case 'Complete':
                displayName = 'Hoàn thành bài học';
                break;
            case 'Time':
                displayName = 'Thời gian học';
                break;
            case 'Streak':
                displayName = 'Duy trì streak';
                break;
            case 'Result':
                displayName = 'Đạt điểm cao';
                break;
            default:
                displayName = 'Nhiệm vụ';
        }

        return displayName;
    }

    static sortQuestsByPriority(quests: FormattedQuest[]): FormattedQuest[] {
        
        const sorted = quests.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }

            return b.reward.amount - a.reward.amount;
        });

        return sorted;
    }

    static calculateTotalRewards(quests: FormattedQuest[]): { xp: number; gem: number; heart: number; freeze: number } {
        
        const total = quests.reduce(
            (acc, quest) => {
                const { type, amount } = quest.reward;
                if (type === 'xp') acc.xp += amount;
                else if (type === 'gem') acc.gem += amount;
                else if (type === 'heart') acc.heart += amount;
                else if (type === 'freeze') acc.freeze += amount;
                
                return acc;
            },
            { xp: 0, gem: 0, heart: 0, freeze: 0 }
        );

        return total;
    }

    static getCompletionStatusText(progress: number, total: number, isCompleted: boolean): string {
        
        let statusText = '';
        if (isCompleted) {
            statusText = 'Hoàn thành';
        } else if (progress >= total) {
            statusText = 'Sẵn sàng nhận thưởng';
        } else {
            statusText = `${progress}/${total}`;
        }

        return statusText;
    }

    static isQuestReadyToClaim(progress: number, total: number, isCompleted: boolean): boolean {
        const readyToClaim = progress >= total && !isCompleted;
        return readyToClaim;
    }

    static getQuestPriorityScore(quest: FormattedQuest): number {
        let score = 0;
        
        if (!quest.isCompleted) {
            score += 100;
        }
        
        const progressRatio = quest.progress / quest.total;
        score += progressRatio * 50;
        
        score += quest.reward.amount * 0.1;
        
        return score;
    }
}