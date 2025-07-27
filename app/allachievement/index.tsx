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
import { useAuth } from "../../hooks/useAuth";
import AchievementList from "./../../components/AchievementList";

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

  const userId = user.id || user._id;

  // Debug log to see user object
  console.log("AllAchievement - User object:", {
    hasUser: !!user,
    userId: userId,
    userKeys: user ? Object.keys(user) : "no user",
    userIdField: user?.id,
    user_IdField: user?._id,
    isAuthenticated: isAuthenticated,
    isLoading: isLoading,
  });

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Không tìm thấy ID người dùng</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity
        style={styles.backButtonGradient}
        onPress={handleGoBack}
      >
        <View style={styles.gradientInner}>
          <Text style={styles.backIconWhite}>←</Text>
        </View>
      </TouchableOpacity>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <AchievementList
            userId={userId}
            userStats={{
              xp: user.xp || 0,
              completed_lessons: 0,
              completed_courses: 0,
              has_practiced: (user.xp || 0) > 0,
              streak_days: user.streakDays || 0,
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
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 90,
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
  },
});

export default AllAchievement;
