
export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: string;
    value?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  progress_text?: string;
  is_unlocked?: boolean;
  unlock_at?: string | null;
}

export interface ProcessedAchievement {
  id: string;
  level: string;
  className: string;
  icon: any;
  name: string;
  progressText: string;
  percentage: number;
  desc: string;
  isUnlocked: boolean;
  unlockDate?: string | null; 
  condition: {
    type: string;
    value?: number;
  };
}

export interface UserAchievementResponse {
  data: Achievement[];
  pagination: any;
  message: string;
}

export interface UseAchievementsProps {
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

export interface UseAchievementsReturn {
  achievements: ProcessedAchievement[];
  loading: boolean;
  error: string | null;
  refreshAchievements: () => Promise<void>;
}