import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageUtils = {
    async saveUserId(userId: any) {
        try {
            if (userId) {
                await AsyncStorage.setItem('userId', userId);
            } else {
                console.warn('User ID is undefined, skipping saveUserId');
            }
        } catch (error) {
            console.error('Error saving user ID:', error);
        }
    },

    async getUserId() {
        try {
            const userId = await AsyncStorage.getItem('userId');
            return userId;
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    },

    async saveUserToken(token: any) {
        try {
            if (token) {
                await AsyncStorage.setItem('userToken', token);
            } else {
                console.warn('Token is undefined, skipping saveUserToken');
            }
        } catch (error) {
            console.error('Error saving user token:', error);
        }
    },

    async getUserToken() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log('Current token:', token);
            return token;
        } catch (error) {
            console.error('Error getting user token:', error);
            return null;
        }
    },

    async saveUserSession(user: any, token: any) {
        try {
            const userId = user?.id || user?._id;
            if (!userId || !token || !user) {
                throw new Error('Invalid user session data');
            }

            await AsyncStorage.multiSet([
                ['userId', userId],
                ['userToken', token],
                ['userData', JSON.stringify(user)],
            ]);
        } catch (error) {
            console.error('Error saving user session:', error);
        }
    },

    async getCachedUserData() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting cached user data:', error);
            return null;
        }
    },

    async clearUserData() {
        try {
            await AsyncStorage.multiRemove(['userId', 'userToken', 'userData']);
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    },
};
