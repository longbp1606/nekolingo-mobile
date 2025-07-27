import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

interface LeaderboardUser {
  _id: string;
  xp: number;
}

interface UserDetail {
  _id: string;
  email: string;
  role: number;
  current_level: number;
  xp: number;
  weekly_xp: number;
  streak_days: number;
  is_premiere: boolean;
  balance: number;
  hearts: number;
  is_active: boolean;
  username?: string;
}

interface UserResponse {
  data: {
    user: UserDetail;
    current_course: any;
    current_topic: any;
    current_lesson: any;
    lesson_status: string;
    completed_topics: any[];
    completed_courses: any[];
    streak_list: any[];
  };
  pagination: any;
  message: string;
}

interface DetailedUser {
  rank: number;
  _id: string;
  name: string;
  email: string;
  score: string;
  xp: number;
  avatar: string;
  color: string;
  isOnline: boolean;
  level: number;
  streak: number;
  hearts: number;
}

interface TournamentLeaderboards {
  bronze: DetailedUser[];
  silver: DetailedUser[];
  gold: DetailedUser[];
  diamond: DetailedUser[];
}

class LeaderboardService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return token;
    } catch (error) {
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getOverallLeaderboard(): Promise<LeaderboardUser[]> {
    try {
      const data = await this.makeRequest<LeaderboardUser[]>(
        "/api/leaderboard/overall"
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserDetail | null> {
    try {
      const data = await this.makeRequest<UserResponse>(`/api/user/${userId}`);
      return data.data.user;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async getDetailedLeaderboard(): Promise<DetailedUser[]> {
    try {
      const leaderboardUsers = await this.getOverallLeaderboard();

      const detailedUsersPromises = leaderboardUsers.map(
        async (user, index) => {
          try {
            const userDetail = await this.getUserById(user._id);

            if (!userDetail || userDetail.role !== 0 || !userDetail.is_active) {
              return null;
            }

            const detailedUser: DetailedUser = {
              rank: index + 1,
              _id: user._id,
              name: userDetail.username || userDetail.email.split("@")[0],
              email: userDetail.email,
              score: `${user.xp} XP`,
              xp: user.xp,
              avatar: (userDetail.username || userDetail.email)
                .charAt(0)
                .toUpperCase(),
              color: this.getRandomColor(),
              isOnline: true,
              level: userDetail.current_level,
              streak: userDetail.streak_days,
              hearts: userDetail.hearts,
            };

            return detailedUser;
          } catch (error) {
            if (error instanceof Error && error.message.includes("404")) {
              return null;
            }
            return null;
          }
        }
      );

      const detailedUsersResults = await Promise.all(detailedUsersPromises);

      const validUsers = detailedUsersResults.filter(
        (user): user is DetailedUser => user !== null
      );

      const sortedUsers = validUsers.sort((a, b) => b.xp - a.xp);
      return sortedUsers.map((user, index) => ({ ...user, rank: index + 1 }));
    } catch (error) {
      throw error;
    }
  }

  private getRandomColor(): string {
    const colors = [
      "#ff9500",
      "#ff69b4",
      "#ff4444",
      "#4CAF50",
      "#9966ff",
      "#00BFFF",
      "#FFD700",
      "#FF6347",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async getTournamentLeaderboards(): Promise<TournamentLeaderboards> {
    try {
      const allUsers = await this.getDetailedLeaderboard();

      const bronze = allUsers.filter((user) => user.xp < 500);
      const silver = allUsers.filter(
        (user) => user.xp >= 500 && user.xp < 2000
      );
      const gold = allUsers.filter(
        (user) => user.xp >= 2000 && user.xp < 10000
      );
      const diamond = allUsers.filter((user) => user.xp >= 10000);

      const updateRanks = (users: DetailedUser[]) =>
        users
          .sort((a, b) => b.xp - a.xp)
          .map((user, index) => ({ ...user, rank: index + 1 }));

      return {
        bronze: updateRanks(bronze),
        silver: updateRanks(silver),
        gold: updateRanks(gold),
        diamond: updateRanks(diamond),
      };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUserRank(
    currentUserId: string
  ): Promise<{ rank: number; tournament: string } | null> {
    try {
      const detailedUsers = await this.getDetailedLeaderboard();
      const userIndex = detailedUsers.findIndex(
        (user) => user._id === currentUserId
      );

      if (userIndex === -1) {
        return null;
      }

      const userXp = detailedUsers[userIndex].xp;
      let tournament = "bronze";

      if (userXp >= 10000) tournament = "diamond";
      else if (userXp >= 2000) tournament = "gold";
      else if (userXp >= 500) tournament = "silver";

      const tournamentData = await this.getTournamentLeaderboards();
      const tournamentUsers =
        tournamentData[tournament as keyof TournamentLeaderboards];
      const userInTournament = tournamentUsers.find(
        (user) => user._id === currentUserId
      );

      return {
        rank: userInTournament?.rank || userIndex + 1,
        tournament,
      };
    } catch (error) {
      return null;
    }
  }
}

export default new LeaderboardService();
