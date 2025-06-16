import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, ProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch, RootState } from "../../stores";
import { fetchLessons } from "../../stores/lessonsSlice";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { lessons, loading } = useSelector((state: RootState) => state.lessons);

  useEffect(() => {
    if (user) {
      dispatch(fetchLessons(user.selectedLanguage));
    }
  }, [dispatch, user]);

  // Calculate streak progress
  const streakProgress = user ? Math.min(user.streak / 30, 1) : 0;

  // Calculate daily goal progress
  const dailyXpGoalProgress = user ? Math.min(user.xp / user.dailyGoal, 1) : 0;

  const navigateToLesson = (lessonId: string) => {
    router.push({
      pathname: "/lessons/detail",
      params: { id: lessonId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.profilePicture || "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {user?.level || 1}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily progress */}
        <Card style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={dailyXpGoalProgress}
              color={Colors.quaternary}
            />
            <Text style={styles.progressText}>
              {user?.xp || 0} / {user?.dailyGoal || 20} XP
            </Text>
          </View>
        </Card>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.sectionTitle}>Your Streak</Text>
            <Text style={styles.streakDays}>{user?.streak || 0} days</Text>
          </View>
          <ProgressBar progress={streakProgress} color={Colors.secondary} />
          <Text style={styles.streakText}>
            {streakProgress >= 1
              ? "Amazing! You've reached a 30 day streak!"
              : "Keep practicing daily to build your streak!"}
          </Text>
        </Card>

        {/* Continue learning section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading lessons...</Text>
        ) : lessons && lessons.length > 0 ? (
          <View style={styles.lessonsContainer}>
            {lessons.slice(0, 3).map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => navigateToLesson(lesson.id)}
              >
                <Card variant="elevated" style={styles.lessonCardInner}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    {lesson.isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.lessonDescription}>
                    {lesson.description}
                  </Text>
                  <Text style={styles.lessonXP}>+{lesson.xpReward} XP</Text>
                </Card>
              </TouchableOpacity>
            ))}

            <Button
              title="See all lessons"
              variant="outline"
              onPress={() => router.push("/lessons")}
              style={styles.seeAllButton}
            />
          </View>
        ) : (
          <Text style={styles.noLessonsText}>No lessons available.</Text>
        )}

        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          <Button
            title="Practice"
            variant="secondary"
            onPress={() => router.push("/practice")}
            style={styles.navButton}
          />
          <Button
            title="Leaderboard"
            variant="tertiary"
            onPress={() => router.push("/leaderboard")}
            style={styles.navButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.primary,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
  },
  userTextContainer: {
    marginLeft: Sizes.md,
  },
  welcomeText: {
    fontSize: Sizes.caption,
    color: "#fff",
  },
  userName: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: "#fff",
  },
  levelBadge: {
    backgroundColor: "#fff",
    paddingVertical: Sizes.xs,
    paddingHorizontal: Sizes.md,
    borderRadius: 16,
  },
  levelText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: Sizes.md,
  },
  progressCard: {
    marginBottom: Sizes.md,
  },
  progressContainer: {
    marginTop: Sizes.sm,
  },
  progressText: {
    marginTop: Sizes.xs,
    textAlign: "right",
    fontSize: Sizes.caption,
    color: Colors.textLight,
  },
  streakCard: {
    marginBottom: Sizes.lg,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  streakDays: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  streakText: {
    marginTop: Sizes.xs,
    fontSize: Sizes.caption,
    color: Colors.textLight,
  },
  sectionHeader: {
    marginVertical: Sizes.sm,
  },
  sectionTitle: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: Colors.textDark,
  },
  loadingText: {
    textAlign: "center",
    marginVertical: Sizes.lg,
    color: Colors.textLight,
  },
  lessonsContainer: {
    marginBottom: Sizes.lg,
  },
  lessonCard: {
    marginBottom: Sizes.sm,
  },
  lessonCardInner: {
    padding: Sizes.md,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  lessonTitle: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: Colors.textDark,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    paddingVertical: 2,
    paddingHorizontal: Sizes.xs,
    borderRadius: 4,
  },
  completedText: {
    color: "#fff",
    fontSize: Sizes.small,
    fontWeight: "bold",
  },
  lessonDescription: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.sm,
  },
  lessonXP: {
    fontSize: Sizes.caption,
    fontWeight: "bold",
    color: Colors.quaternary,
  },
  seeAllButton: {
    marginTop: Sizes.sm,
  },
  noLessonsText: {
    textAlign: "center",
    marginVertical: Sizes.lg,
    color: Colors.textLight,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: Sizes.lg,
  },
  navButton: {
    flex: 1,
    marginHorizontal: Sizes.xs,
  },
});
