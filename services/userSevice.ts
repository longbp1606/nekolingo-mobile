import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageUtils } from '../utils/storage';
import AuthService from './authService';
import { API_BASE_URL } from './config';

async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem('userToken');
    } catch (error) {
        console.error('[getToken] Error:', error);
        return null;
    }
}

async function getHeaders(): Promise<Record<string, string>> {
    const token = await getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

export const userService = {
    async getUserProfile(userId: string | null = null) {
        try {
            console.log('[getUserProfile] Called with userId:', userId);

            if (!userId) {
                const token = await getToken();
                console.log('[getUserProfile] Retrieved token:', token);

                if (!token) {
                    const cachedUser = await StorageUtils.getCachedUserData();
                    if (cachedUser) {
                        console.log('[getUserProfile] Using cached user data due to missing token');
                        return { user: cachedUser };
                    }
                    throw new Error('NO_TOKEN');
                }

                const isValid = await AuthService.validateToken(token);
                if (!isValid) {
                    await StorageUtils.clearUserData();
                    throw new Error('TOKEN_EXPIRED');
                }

                const userProfile = await AuthService.getProfile(token);
                const headers = await getHeaders();
                const response = await fetch(`${API_BASE_URL}/api/user/${userProfile.id}`, { headers });
                const detailResponse = await response.json();

                const combinedUserData = {
                    user: {
                        ...detailResponse.data.user,
                        name: userProfile.name,
                        username: userProfile.username,
                        selectedLanguage: userProfile.selectedLanguage,
                        streak: detailResponse.data.user.streak_days || userProfile.streak,
                        level: detailResponse.data.user.current_level || userProfile.level,
                    },
                    ...detailResponse.data
                };

                await StorageUtils.saveUserSession(combinedUserData.user, token);
                return combinedUserData;
            }

            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, { headers });
            const data = await response.json();
            return data;

        } catch (error: any) {
            console.error('[getUserProfile] Final catch error:', error);

            if (error.message === 'NO_TOKEN' || error.message === 'TOKEN_EXPIRED') {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (error.message?.includes('Network')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra internet.');
            }

            throw error;
        }
    },

    async checkAuthStatus() {
        try {
            const token = await getToken();
            if (!token) return { isAuthenticated: false, reason: 'NO_TOKEN' };

            const isValid = await AuthService.validateToken(token);
            if (!isValid) {
                await StorageUtils.clearUserData();
                return { isAuthenticated: false, reason: 'TOKEN_EXPIRED' };
            }

            return { isAuthenticated: true };
        } catch (error) {
            return { isAuthenticated: false, reason: 'ERROR', error };
        }
    },

    async getCurrentUser() {
        try {
            const authStatus = await this.checkAuthStatus();
            if (!authStatus.isAuthenticated) return null;

            const token = await getToken();
            if (!token) return null;

            return await AuthService.getProfile(token);
        } catch (error) {
            console.error('[getCurrentUser] Error:', error);
            return null;
        }
    },

    async refreshUserProfile() {
        try {
            const token = await getToken();
            if (!token) throw new Error('NO_TOKEN');

            const userProfile = await AuthService.getProfile(token);
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/user/${userProfile.id}`, { headers });
            const detailResponse = await response.json();

            const combinedUserData = {
                user: {
                    ...detailResponse.data.user,
                    name: userProfile.name,
                    username: userProfile.username,
                    selectedLanguage: userProfile.selectedLanguage,
                    streak: detailResponse.data.user.streak_days || userProfile.streak,
                    level: detailResponse.data.user.current_level || userProfile.level,
                },
                ...detailResponse.data
            };

            await StorageUtils.saveUserSession(combinedUserData.user, token);
            return combinedUserData;
        } catch (error) {
            console.error('[refreshUserProfile] Error:', error);
            throw error;
        }
    },

    async updateUserProfile(userId: string, userData: any) {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(userData),
            });
            const data = await response.json();

            if (data?.user) {
                const token = await getToken();
                if (token) {
                    await StorageUtils.saveUserSession(data.user, token);
                }
            }

            return data;
        } catch (error) {
            console.error('[updateUserProfile] Error:', error);
            throw error;
        }
    },

    async getFollowing(userId: string) {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/following`, { headers });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[getFollowing] Error:', error);
            return [];
        }
    },

    async getFollowers(userId: string) {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/followers`, { headers });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[getFollowers] Error:', error);
            return [];
        }
    }
};
