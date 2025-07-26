import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { userService } from '../../services/userSevice';
import AchievementList from './../../components/AchievementList';

interface User {
    id?: string;
    _id?: string;
    xp?: number;
    streak_days?: number;
    streak?: number;
}

interface UserProfile {
    user: User;
}

const AllAchievement: React.FC = () => {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const userData = await userService.getUserProfile();
            setUserProfile(userData as UserProfile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!userProfile || !userProfile.user || !(userProfile.user.id || userProfile.user._id)) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text>Không tìm thấy thông tin người dùng</Text>
                    <TouchableOpacity onPress={loadUserProfile}>
                        <Text>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <TouchableOpacity style={styles.backButtonGradient} onPress={handleGoBack}>
                <View style={styles.gradientInner}>
                    <Text style={styles.backIconWhite}>←</Text>
                </View>
            </TouchableOpacity>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <AchievementList
                        userId={userProfile.user.id || userProfile.user._id}
                        userStats={{
                            xp: userProfile.user.xp || 0,
                            completed_lessons: 0,
                            completed_courses: 0,
                            has_practiced: (userProfile.user.xp || 0) > 0,
                            streak_days: userProfile.user.streak_days || userProfile.user.streak || 0,
                            perfect_lessons: 0,
                        }}
                        showViewAll={false}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 15,
        paddingTop: 90,
    },

    backButtonGradient: {
        position: 'absolute',
        top: 30,
        left: 16,
        width: 44,
        height: 44,
        zIndex: 1,
    },
    gradientInner: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#00C2D1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIconWhite: {
        fontSize: 30,
        color: '#ffffff',
        fontWeight: '700',
        marginTop: -12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default AllAchievement;