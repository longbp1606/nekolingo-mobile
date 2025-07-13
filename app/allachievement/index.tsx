import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AchievementList from './../../components/AchievementList';

const AllAchievement: React.FC = () => {
    const router = useRouter();

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

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
                    <AchievementList showViewAll={false} />
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

});

export default AllAchievement;