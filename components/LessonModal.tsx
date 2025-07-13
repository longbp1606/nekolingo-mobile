import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LessonModalProps {
    visible: boolean;
    onClose: () => void;
    lesson: {
        icon: keyof typeof Ionicons.glyphMap;
        status: 'locked' | 'in-progress' | 'complete';
        title: string;
        lessonId?: string;
    };
    unitId: number;
    onStartLesson: (lessonId: string) => void;
}

const { width } = Dimensions.get('window');

const getUnitColor = (unitId: number) => {
    const colors: { [key: number]: string } = {
        1: '#00C2D1',
        2: '#9C27B0',
        3: '#4DAA02',
        4: '#FF5722',
        5: '#009EB2',
        6: '#e100ffff',
        7: '#FF4B4B',
        8: '#4B4B4B',
    };
    return colors[unitId] || '#00C2D1';
};

const LessonModal: React.FC<LessonModalProps> = ({
    visible,
    onClose,
    lesson,
    unitId,
    onStartLesson
}) => {
    const getModalStyle = () => {
        const unitColor = getUnitColor(unitId);

        switch (lesson.status) {
            case 'in-progress':
                return {
                    backgroundColor: '#FFD700',
                    buttonColor: '#FFFFFF',
                    buttonTextColor: '#FFD700',
                };
            case 'complete':
                return {
                    backgroundColor: unitColor,
                    buttonColor: '#FFFFFF',
                    buttonTextColor: unitColor,
                    secondaryButtonColor: '#FFFFFF',
                };
            case 'locked':
                return {
                    backgroundColor: '#BDBDBD',
                    buttonColor: '#E0E0E0',
                    buttonTextColor: '#757575',
                };
            default:
                return {
                    backgroundColor: '#BDBDBD',
                    buttonColor: '#E0E0E0',
                    buttonTextColor: '#757575',
                };
        }
    };

    const getButtonStyle = () => {
        const baseStyle = [
            styles.primaryButton,
            { backgroundColor: modalStyle.buttonColor }
        ];

        if (lesson.status === 'complete' || lesson.status === 'locked') {
            baseStyle.push({
                borderBottomWidth: 3,
                borderBottomColor: '#BDBDBD'
            } as any);
        }
        if (lesson.status === 'in-progress') {
            baseStyle.push({
                borderBottomWidth: 3,
                borderBottomColor: '#BDBDBD'
            } as any);
        }

        return baseStyle;
    };

    const modalStyle = getModalStyle();

    const handleButtonPress = () => {

        if (lesson.status === 'locked') {
            onClose();
            return;
        }

        if (lesson.lessonId) {
            onStartLesson(lesson.lessonId);
        } else {
            onClose();
        }
    };

    const renderContent = () => {
        switch (lesson.status) {
            case 'in-progress':
                return (
                    <View style={[styles.modalContent, { backgroundColor: modalStyle.backgroundColor }]}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name={lesson.icon} size={40} color="white" />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>{lesson.title}</Text>
                        <Text style={styles.modalSubtitle}>
                            Bắt đầu hành trình mới với bài học mới!
                        </Text>
                        <TouchableOpacity
                            style={getButtonStyle()}
                            onPress={handleButtonPress}
                        >
                            <Text style={[styles.primaryButtonText, { color: modalStyle.buttonTextColor }]}>
                                {lesson.lessonId ? 'BẮT ĐẦU +25 KN' : 'DEMO - BẮT ĐẦU +25 KN'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'complete':
                return (
                    <View style={[styles.modalContent, { backgroundColor: modalStyle.backgroundColor }]}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name={lesson.icon} size={40} color="white" />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>{lesson.title}</Text>
                        <Text style={styles.modalSubtitle}>
                            Chinh phục cấp độ Huyền thoại để chứng minh trình độ
                        </Text>
                        <TouchableOpacity
                            style={getButtonStyle()}
                            onPress={handleButtonPress}
                        >
                            <Text style={[styles.primaryButtonText, { color: modalStyle.buttonTextColor }]}>
                                {lesson.lessonId ? 'ÔN TẬP +5 KN' : 'DEMO - ÔN TẬP +5 KN'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'locked':
                return (
                    <View style={[styles.modalContent, { backgroundColor: modalStyle.backgroundColor }]}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="star" size={40} color="white" />
                            </View>
                        </View>
                        <Text style={[styles.modalTitle, { color: '#666' }]}>{lesson.title}</Text>
                        <Text style={[styles.modalSubtitle, { color: '#666' }]}>
                            Hãy hoàn thành tất cả các cấp độ phía trên để mở khóa nhé!
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: modalStyle.buttonColor },
                                lesson.status === 'locked' && { borderBottomWidth: 2, borderBottomColor: '#BDBDBD' }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.primaryButtonText, { color: modalStyle.buttonTextColor }]}>
                                KHÓA
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackground}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View style={styles.modalContainer}>
                        {renderContent()}
                    </View>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.8,
        maxWidth: 320,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        marginBottom: 16,
        marginTop: -60,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LessonModal;