import { useRouter } from "expo-router";
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ROUTES } from "../config/routes";

// Data
export const percentage1: number = 40;
export const percentage2: number = 0;
export const percentage3: number = 100;

export const achievements = [
    {
        level: "CẤP 1",
        className: "fire",
        icon: require('../assets/images/flame.png'),
        name: "Lửa rồng",
        progressText: "2/3",
        percentage: percentage1,
        desc: "Đạt chuỗi 3 ngày streak",
    },
    {
        level: "CẤP 2",
        className: "scholar",
        icon: require('../assets/images/star-3d.png'),
        name: "Cao nhân",
        progressText: "237/250",
        percentage: percentage2,
        desc: "Đạt được 250 XP",
    },
    {
        level: "CẤP 1",
        className: "student",
        icon: require('../assets/images/master-data.png'),
        name: "Học giả",
        progressText: "0/50",
        percentage: percentage3,
        desc: "Học 50 từ mỗi trong một khóa học",
    },
    {
        level: "CẤP 1",
        className: "fire",
        icon: require('../assets/images/flame.png'),
        name: "Lửa rồng",
        progressText: "2/3",
        percentage: percentage1,
        desc: "Đạt chuỗi 3 ngày streak",
    },
    {
        level: "CẤP 2",
        className: "scholar",
        icon: require('../assets/images/star-3d.png'),
        name: "Cao nhân",
        progressText: "237/250",
        percentage: percentage2,
        desc: "Đạt được 250 XP",
    },
    {
        level: "CẤP 1",
        className: "student",
        icon: require('../assets/images/master-data.png'),
        name: "Học giả",
        progressText: "0/50",
        percentage: percentage3,
        desc: "Học 50 từ mỗi trong một khóa học",
    },
];

const theme = {
    color: {
        white: '#FFFFFF',
        title: '#4B4B4B',
        primary: '#00C2D1',
        darkPrimary: '#009EB2',
        description: '#777',
        red: '#FF4B4B',
        bgRed: '#FFDFE0',
        green: '#58CC02',
        bgGreen: '#D7FFB8',
        bgBlue: '#CCF2F5',
        darkGreen: '4DAA02',
        darkRed: 'E04343',
        lightOrange: 'FFD700',
        orange: 'FFA500',
        lightPurple: 'AB47BC',
        darkPurple: '9C27B0',
    },
};

interface AchievementListProps {
    showViewAll?: boolean;
    limit?: number;
}

const AchievementList: React.FC<AchievementListProps> = ({
    showViewAll = true,
    limit,
}) => {
    const router = useRouter(); // Di chuyển useRouter vào trong component
    const displayedAchievements = limit ? achievements.slice(0, limit) : achievements;

    const getIconWrapperStyle = (className: string) => {
        switch (className) {
            case 'fire':
                return [
                    styles.achievementIconWrapper,
                    {
                        backgroundColor: theme.color.bgRed,
                        borderColor: theme.color.red,
                        borderBottomColor: theme.color.red,
                    },
                ];
            case 'scholar':
                return [
                    styles.achievementIconWrapper,
                    {
                        backgroundColor: theme.color.bgGreen,
                        borderColor: theme.color.green,
                        borderBottomColor: theme.color.green,
                    },
                ];
            case 'student':
                return [
                    styles.achievementIconWrapper,
                    {
                        backgroundColor: theme.color.bgBlue,
                        borderColor: theme.color.primary,
                        borderBottomColor: theme.color.primary,
                    },
                ];
            default:
                return styles.achievementIconWrapper;
        }
    };

    const getTextColor = (className: string) => {
        switch (className) {
            case 'fire':
                return theme.color.red;
            case 'scholar':
                return theme.color.green;
            case 'student':
                return theme.color.primary;
            default:
                return theme.color.title;
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.achievementSection}>
                <View style={styles.achievementHeader}>
                    <Text style={styles.achievementTitle}>Thành tích</Text>
                    {showViewAll && (
                        <TouchableOpacity onPress={() => router.push(ROUTES.ALLACHIEVEMENT as any)}>
                            <Text style={styles.viewAllLink}>XEM TẤT CẢ</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.achievementListWrapper}>
                    {displayedAchievements.map((ach, index) => (
                        <View key={index} style={styles.achievementItem}>
                            {index > 0 && <View style={styles.separator} />}

                            <View style={getIconWrapperStyle(ach.className)}>
                                <Image source={ach.icon} style={styles.achievementImg} />
                                <Text style={[styles.achievementText, { color: getTextColor(ach.className) }]}>
                                    {ach.level}
                                </Text>
                            </View>

                            <View style={styles.achievementInfo}>
                                <View style={styles.achievementLead}>
                                    <Text style={styles.achievementName}>{ach.name}</Text>
                                    <Text style={styles.achievementDesc}>{ach.progressText}</Text>
                                </View>

                                <View style={styles.achievementProgress}>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${ach.percentage}%`,
                                                    backgroundColor: ach.percentage === 100 ? theme.color.green : '#FFA500',
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.achievementDescBottom}>{ach.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.color.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e5e5e5',
        marginBottom: 20,
    },
    achievementSection: {
        flex: 1,
    },
    achievementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementTitle: {
        fontSize: 25,
        fontWeight: '700',
        margin: 0,
        color: theme.color.title,
    },
    viewAllLink: {
        fontSize: 12,
        color: theme.color.primary,
        fontWeight: '600',
    },
    achievementListWrapper: {
        borderWidth: 2,
        borderColor: '#e5e5e5',
        borderRadius: 12,
    },
    achievementItem: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        position: 'relative',
    },
    separator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#e5e5e5',
    },
    achievementIconWrapper: {
        width: 80,
        height: 100,
        borderRadius: 8,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderBottomWidth: 5,
        padding: 8,
    },
    achievementImg: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 12,
        fontWeight: '600',
    },
    achievementInfo: {
        flex: 1,
        gap: 8,
    },
    achievementLead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    achievementName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.color.title,
        flex: 1,
    },
    achievementDesc: {
        fontSize: 14,
        color: theme.color.description,
    },
    achievementDescBottom: {
        fontSize: 14,
        color: theme.color.description,
        lineHeight: 20,
    },
    achievementProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        minWidth: 2,
    },
});

export default AchievementList;