import { AntDesign, Entypo, Feather, FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FriendsScreen from './FriendsScreen';
import PopupInvite from './PopupInvite';

const { width: screenWidth } = Dimensions.get('window');

interface Course {
    id: string;
    name: string;
    flag: string;
    code: string;
}

interface HeartShopItemData {
    id: string;
    icon: string;
    title: string;
    subtitle?: string;
    price?: number;
    isFree?: boolean;
}

interface MonthData {
    month: number;
    year: number;
    activeDays: number[];
    streakDays?: number[];
}

const monthsData: MonthData[] = [
    {
        month: 6,
        year: 2025,
        activeDays: [1, 2, 3, 5, 6, 12, 13, 16, 17, 19, 20],
        streakDays: [8, 9, 10, 15],
    },
    {
        month: 7,
        year: 2025,
        activeDays: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11],
        streakDays: [4],
    },
    {
        month: 8,
        year: 2025,
        activeDays: [],
    },
    {
        month: 9,
        year: 2025,
        activeDays: [],
    },
];

interface StatItemData {
    id: string;
    icon: any;
    value: string | number;
    color: string;
    modal: {
        title: string;
        content: string;
        description?: string;
        type: 'courses' | 'streak' | 'hearts';
        progress?: number;
        maxProgress?: number;
        hearts?: number;
        maxHearts?: number;
    };
}

const StatsBar: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course>({
        id: 'en',
        name: 'Tiếng Anh',
        flag: 'us',
        code: 'EN'
    });

    const monthsData: MonthData[] = [
        {
            month: 6,
            year: 2025,
            activeDays: [1, 2, 3, 5, 6, 12, 13, 16, 17, 19, 20],
            streakDays: [8, 9, 10, 15],
        },
        {
            month: 7,
            year: 2025,
            activeDays: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11],
            streakDays: [4],
        },
        {
            month: 8,
            year: 2025,
            activeDays: [],
        },
        {
            month: 9,
            year: 2025,
            activeDays: [],
        },
    ];

    const [currentMonthIndex, setCurrentMonthIndex] = useState(1); // Bắt đầu từ tháng 7 (index 1)

    const heartShopItems: HeartShopItemData[] = [
        {
            id: 'unlimited',
            icon: '♾️',
            title: 'VÔ HẠN',
            subtitle: 'THỬ MIỄN PHÍ',
            isFree: true
        },
        {
            id: 'refill',
            icon: '🔋',
            title: 'Sạc',
            price: 500
        },
        {
            id: 'practice',
            icon: '🎯',
            title: 'Sạc tạm',
            subtitle: 'XEM QUẢNG CÁO'
        }
    ];

    const statsData: StatItemData[] = [
        {
            id: 'courses',
            icon: (
                <Image
                    source={require('../assets/images/united-states.png')}
                    style={styles.flagIcon}
                />
            ),
            value: selectedCourse.code,
            color: '#00C2D1',
            modal: {
                title: 'Các khóa học',
                content: '',
                type: 'courses'
            }
        },
        {
            id: 'streak',
            icon: (
                <Image
                    source={require('../assets/images/flame.png')}
                    style={styles.streakIcon}
                />
            ),
            value: 1,
            color: '#FFA500',
            modal: {
                title: '1 ngày streak',
                content: 'Hôm qua streak của bạn đã được đóng băng. Tiếp tục duy trì streak!',
                type: 'streak',
                progress: 1,
                maxProgress: 7
            }
        },
        {
            id: 'hearts',
            icon: (
                <Image
                    source={require('../assets/images/heart.png')}
                    style={styles.heartIcon}
                />
            ),
            value: 25,
            color: '#FF4B4B',
            modal: {
                title: 'Năng lượng',
                content: 'Bạn có đầy đủ trái tim',
                description: 'Tiếp tục học',
                type: 'hearts',
                hearts: 25,
                maxHearts: 30
            }
        }
    ];

    const handleCourseSelect = (course: Course) => {
        setSelectedCourse(course);
        setActiveModal(null);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const goToPreviousMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonthIndex < monthsData.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const getCurrentMonthData = () => {
        return monthsData[currentMonthIndex];
    };

    const getMonthName = (month: number) => {
        const monthNames = [
            'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
            'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
        ];
        return monthNames[month - 1];
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        const firstDay = new Date(year, month - 1, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1; // Chuyển đổi từ 0-6 (CN-T7) sang 0-6 (T2-CN)
    };

    // Utility functions để tính toán
    const getStudyDays = (monthData: MonthData): number => {
        return monthData.activeDays.length;
    };

    const getStreakFreezeUsed = (monthData: MonthData): number => {
        return monthData.streakDays?.length || 0;
    };

    // Sử dụng trong component
    const renderCalendarDays = () => {
        const currentMonth = getCurrentMonthData();
        const daysInMonth = getDaysInMonth(currentMonth.month, currentMonth.year);
        const firstDay = getFirstDayOfMonth(currentMonth.month, currentMonth.year);
        const days = [];

        // Thêm ô trống cho các ngày của tháng trước
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <View key={`empty-${i}`} style={styles.calendarDay}>
                    <Text style={styles.emptyDayText}></Text>
                </View>
            );
        }

        // Thêm các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const isActive = currentMonth.activeDays.includes(day);
            const isStreakDay = currentMonth.streakDays?.includes(day) || false;

            days.push(
                <View key={day} style={styles.calendarDay}>
                    {isActive ? (
                        <View style={styles.activeDay}>
                            <Text style={styles.activeDayText}>{day}</Text>
                        </View>
                    ) : isStreakDay ? (
                        <View style={styles.streakDay}>
                            <Text style={styles.streakDayText}>{day}</Text>
                        </View>
                    ) : (
                        <Text style={styles.inactiveDayText}>{day}</Text>
                    )}
                </View>
            );
        }

        return days;
    };

    const renderCoursesModal = () => (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Khóa học</Text>

                <View style={styles.courseContainer}>
                    <Image
                        source={require(`../assets/images/united-states.png`)}
                        style={styles.courseFlagLarge}
                    />
                    <Text style={styles.courseName}>{selectedCourse.name}</Text>
                </View>

                <TouchableOpacity style={styles.addCourseButton}>
                    <Text style={styles.addCourseIcon}>+</Text>
                    <Text style={styles.addCourseText}>Khóa học</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeartsModal = () => (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Năng lượng</Text>
                    <Text style={styles.modalSubtitle}><FontAwesome6 name="bolt-lightning" size={14} color="#FFD700" /> 4G 54PH</Text>

                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.row}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '83%' }]} />
                        </View>
                        <Feather name="battery-charging" size={30} color="#ff69b4" />
                    </View>
                    <Text style={styles.progressText}>25 / 30</Text>

                </View>

                {/* Heart Shop Items */}
                <View style={styles.shopContainer}>
                    <View style={styles.shopItemFirst}>
                        <View style={styles.shopItemLeft}>
                            <FontAwesome5 name="infinity" size={20} color="#00C2D1" />
                            <Text style={styles.shopItemTitle}>Vô tận</Text>
                        </View>
                        <Text style={styles.shopItemActionFirst}>THỬ MIỄN PHÍ</Text>
                    </View>

                    <View style={styles.shopItem}>
                        <View style={styles.shopItemLeft}>
                            <Entypo name="battery" size={30} color="#B0B0B0" />
                            <Text style={styles.shopItemTitleSecond}>Sạc</Text>
                        </View>
                        <View style={styles.shopItemRight}>
                            <Text style={styles.gemIcon}>💎</Text>
                            <Text style={styles.shopItemPrice}>500</Text>
                        </View>
                    </View>

                    <View style={styles.shopItem}>
                        <View style={styles.shopItemLeft}>
                            <Ionicons name="battery-charging" size={34} color="#58CC02" />
                            <Text style={styles.shopItemTitle}>Sạc tạm</Text>
                        </View>
                        <Text style={styles.shopItemAction}>XEM QUẢNG CÁO</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderStreakModal = () => {
        const [activeTab, setActiveTab] = useState<'personal' | 'friends'>('personal');
        const currentMonth = getCurrentMonthData();

        return (
            <View style={styles.streakModalContainer}>
                <View style={styles.streakModalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
                            onPress={() => setActiveTab('personal')}
                        >
                            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
                                CÁ NHÂN
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                            onPress={() => setActiveTab('friends')}
                        >
                            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                                BẠN BÈ
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'personal' ? (
                        <View style={styles.personalTab}>
                            <View style={styles.streakHeader}>
                                <View style={styles.streakHeaderLeft}>
                                    <Text style={styles.streakNumber}>1</Text>
                                    <Text style={styles.streakLabel}>ngày streak!</Text>
                                </View>
                                <View style={styles.streakFlame}>
                                    <Image source={require('../assets/images/flame.png')} style={styles.flameIcon} />
                                </View>
                            </View>

                            {/* Calendar */}
                            <View style={styles.calendarContainer}>
                                <View style={styles.calendarHeader}>
                                    <Text style={styles.monthYear}>
                                        {getMonthName(currentMonth.month)} năm {currentMonth.year}
                                    </Text>
                                    <View style={styles.navigationButtons}>
                                        <TouchableOpacity
                                            style={[styles.navButton, currentMonthIndex === 0 && styles.navButtonDisabled]}
                                            onPress={goToPreviousMonth}
                                            disabled={currentMonthIndex === 0}
                                        >
                                            <Text style={[styles.navButtonText, currentMonthIndex === 0 && styles.navButtonTextDisabled]}>‹</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.navButton, currentMonthIndex === monthsData.length - 1 && styles.navButtonDisabled]}
                                            onPress={goToNextMonth}
                                            disabled={currentMonthIndex === monthsData.length - 1}
                                        >
                                            <Text style={[styles.navButtonText, currentMonthIndex === monthsData.length - 1 && styles.navButtonTextDisabled]}>›</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Stats Row */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statItemStreak}>
                                        <View style={styles.statIcon}>
                                            <Text style={styles.statNumber}>{getStudyDays(currentMonth)}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>Ngày học</Text>
                                    </View>
                                    <View style={styles.statItemStreak}>
                                        <View style={styles.statIconBlue}>
                                            <Text style={styles.statNumberWhite}>{getStreakFreezeUsed(currentMonth)}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>Số streak freeze đã dùng</Text>
                                    </View>
                                </View>

                                {/* Calendar Grid */}
                                <View style={styles.calendarGrid}>
                                    {/* <View style={styles.weekDays}>
                                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                            <Text key={day} style={styles.weekDayText}>{day}</Text>
                                        ))}
                                    </View> */}
                                    <View style={styles.calendarDays}>
                                        {renderCalendarDays()}
                                    </View>
                                </View>
                            </View>

                            {/* Streak Goal */}
                            <View style={styles.streakGoal}>
                                <Text style={styles.streakGoalTitle}>Mục tiêu Streak</Text>
                                <View style={styles.streakGoalBar}>
                                    <View style={styles.streakGoalIcon}>
                                        <AntDesign name="calendar" size={24} color="#fff" />
                                    </View>
                                    <View style={styles.streakGoalProgress}>
                                        <View style={styles.streakGoalProgressBar}>
                                            <View style={[styles.streakGoalProgressFill, { width: '14%' }]} />
                                        </View>
                                    </View>
                                    <View style={styles.streakGoalTarget}>
                                        <Text style={styles.streakGoalTargetText}>7</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.friendsTab}>
                            <View style={styles.friendsContent}>
                                <FriendsScreen />
                                <TouchableOpacity style={styles.addFriendsButton} onPress={() => setShowPopup(true)}>
                                    <Text style={styles.addFriendsButtonText}>GỬI LỜI MỜI</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
                {showPopup && (
                    <PopupInvite visible={showPopup} onClose={() => setShowPopup(false)} />
                )}
            </View>

        );
    };
    const [showPopup, setShowPopup] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                {statsData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.statItem,
                        ]}
                        onPress={() => setActiveModal(item.id)}
                    >
                        <View style={styles.statContent}>
                            {item.icon}
                            <Text style={[styles.statValue, { color: item.color }]}>
                                {item.value}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Courses Modal */}
            <Modal
                visible={activeModal === 'courses'}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    {renderCoursesModal()}
                </View>
            </Modal>

            {/* Hearts Modal */}
            <Modal
                visible={activeModal === 'hearts'}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    {renderHeartsModal()}
                </View>
            </Modal>

            {/* Streak Modal */}
            <Modal
                visible={activeModal === 'streak'}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlayStreak}>
                    {renderStreakModal()}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',

    },
    statItem: {
        paddingVertical: 5,
        alignItems: 'center',
        paddingTop: 20,
    },
    statItemStreak: {
        width: '49%',
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 10,
    },
    statContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    flagIcon: {
        width: 28,
        height: 18,
        borderRadius: 2,
    },
    streakIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    heartIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        marginTop: 55,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },
    modalOverlayStreak: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        minHeight: 300,
        position: 'relative',
    },
    modalContent: {
        padding: 20,
        paddingTop: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#4B4B4B',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    courseContainer: {
        alignItems: 'center',
        backgroundColor: '#e7f3ff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#00C2D1',
    },
    courseFlagLarge: {
        width: 60,
        height: 45,
        borderRadius: 8,
        marginBottom: 10,
    },
    courseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00C2D1',
    },
    addCourseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 15,
        gap: 10,
    },
    addCourseIcon: {
        fontSize: 20,
        color: '#999',
    },
    addCourseText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    progressBar: {
        width: '90%',
        height: 20,
        backgroundColor: '#E5E5E5',
        borderRadius: 5,
        overflow: 'hidden',
        marginRight: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#ff69b4',
    },
    progressText: {
        position: 'absolute',
        top: 6,
        right: 155,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4B4B4B',
    },
    shopContainer: {
        gap: 15,
    },
    shopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#e5e5e5',
        borderBottomWidth: 6,
    },
    shopItemFirst: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#ff69b4',
        borderBottomWidth: 6,
    },
    superItem: {
        backgroundColor: 'linear-gradient(135deg, #ff69b4 0%, #00C2D1 100%)',
        borderColor: '#ff69b4',
    },
    shopItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    shopItemIcon: {
        fontSize: 24,
    },
    shopItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B4B4B',
    },
    shopItemTitleSecond: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#B0B0B0',
    },
    shopItemSubtitle: {
        fontSize: 12,
        color: '#00C2D1',
        fontWeight: 'bold',
    },
    shopItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    gemIcon: {
        fontSize: 16,
    },
    shopItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#B0B0B0',
    },
    shopItemAction: {
        fontSize: 12,
        color: '#58CC02',
        fontWeight: 'bold',
    },
    shopItemActionFirst: {
        fontSize: 12,
        color: '#ff69b4',
        fontWeight: 'bold',
    },
    streakModalContainer: {
        backgroundColor: 'white',
        flex: 1,
        position: 'relative',
    },
    streakModalContent: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 0,
    },
    shareButton: {
        position: 'absolute',
        top: 15,
        right: 55,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    shareButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#00C2D1',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    activeTabText: {
        color: '#00C2D1',
    },
    personalTab: {
        flex: 1,
        paddingHorizontal: 20,
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFA500',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    streakHeaderLeft: {
        alignItems: 'flex-start',
    },
    streakNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
    },
    streakLabel: {
        fontSize: 16,
        color: 'white',
        marginTop: -5,
    },
    streakFlame: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    flameIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    monthYear: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B4B4B',
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    navButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        backgroundColor: '#f8f8f8',
    },
    navButtonText: {
        fontSize: 16,
        color: '#666',
    },
    navButtonTextDisabled: {
        color: '#ccc',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative',
    },
    statIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFA500',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    statIconBlue: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#00C2D1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    statNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    statNumberWhite: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    todayBadge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: '#FFA500',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    todayText: {
        fontSize: 8,
        color: 'white',
        fontWeight: 'bold',
    },
    calendarGrid: {
        marginTop: 10,
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    weekDayText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
        width: 30,
        textAlign: 'center',
    },
    calendarDays: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    calendarDay: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    todayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFA500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayDayText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    streakDay: {
        backgroundColor: '#00C2D1',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakDayText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    activeDay: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFA500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDayText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    inactiveDayText: {
        fontSize: 14,
        color: '#ccc',
    },
    streakGoal: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    streakGoalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B4B4B',
        marginBottom: 15,
    },
    streakGoalBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    streakGoalIcon: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#58CC02',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakGoalIconText: {
        fontSize: 16,
    },
    streakGoalProgress: {
        flex: 1,
    },
    streakGoalProgressBar: {
        height: 8,
        backgroundColor: '#D7FFB8',
        borderRadius: 4,
        overflow: 'hidden',
    },
    streakGoalProgressFill: {
        height: '100%',
        backgroundColor: '#58CC02',
        borderRadius: 4,
    },
    streakGoalTarget: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#58CC02',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakGoalTargetText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    friendsTab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendsContent: {
        alignItems: 'center',
    },
    addFriendsButton: {
        backgroundColor: '#00C2D1',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    addFriendsButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    emptyDayText: {
        fontSize: 14,
        color: '#999',
    },
});

export default StatsBar;