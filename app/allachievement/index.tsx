import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AchievementList from "../../components/AchievementList";
import { useAuth } from "../../hooks/useAuth";

const AllAchievement: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Không tìm thấy thông tin người dùng</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text>Đăng nhập lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getUserId = (user: any): string | null => {
    if (user.id && typeof user.id === 'string') return user.id;

    if (user._id && typeof user._id === 'string') return user._id;
    if (user.userId && typeof user.userId === 'string') return user.userId;
    if (user.user_id && typeof user.user_id === 'string') return user.user_id;

    return null;
  };

  const userId = getUserId(user);

  if (!userId) {
    console.error("❌ AllAchievement - No valid userId found");
    console.error("User object structure:", JSON.stringify(user, null, 2));

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy ID người dùng</Text>
          <Text style={styles.debugText}>
            Các trường có sẵn: {user ? Object.keys(user).join(', ') : 'Không có user'}
          </Text>
          <Text style={styles.debugText}>
            ID fields: {JSON.stringify({
              id: user?.id,
              _id: user?._id,
            }, null, 2)}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userStats = {
    xp: user.xp ?? user.total_xp ?? 0,
    completed_lessons: 0, 
    completed_courses: 0, 
    has_practiced: (user.xp ?? user.total_xp ?? 0) > 0,
    streak_days: user.streakDays ?? user.current_streak ?? 0,
    perfect_lessons: 0, 
    currentLevel: user.currentLevel ?? user.level ?? 1,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          <AchievementList
            userId={userId}
            userStats={userStats}
            showViewAll={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllAchievement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: '#007AFF',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  backButtonGradient: {
    position: "absolute",
    top: 30,
    left: 16,
    width: 44,
    height: 44,
    zIndex: 1,
  },
  gradientInner: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#00C2D1",
    justifyContent: "center",
    alignItems: "center",
  },
  backIconWhite: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "700",
    marginTop: -12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});