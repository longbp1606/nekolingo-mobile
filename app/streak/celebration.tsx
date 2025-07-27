import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { useAuth } from "../../hooks/useAuth";

export default function StreakCelebrationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [animation] = useState(new Animated.Value(0));
  const [flameAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start the celebration animation
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(flameAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animation, flameAnimation]);

  const handleContinue = () => {
    router.push("/(tabs)/home");
  };

  const handleViewStreak = () => {
    router.push("/(tabs)/streak" as any);
  };

  const currentStreak = user?.current_streak || 0;
  const streakGoal = Math.ceil(currentStreak / 5) * 5; // Next milestone (5, 10, 15, etc.)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Header */}
        <Animated.View
          style={[
            styles.celebrationHeader,
            {
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebrationTitle}>Streak Increased!</Text>
          <Text style={styles.celebrationSubtitle}>You're on fire! 🔥</Text>
        </Animated.View>

        {/* Streak Display */}
        <View style={styles.streakContainer}>
          <Animated.View
            style={[
              styles.streakCircle,
              {
                opacity: flameAnimation,
                transform: [
                  {
                    rotate: flameAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.flameIcon}>🔥</Text>
          </Animated.View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        {/* Motivation Message */}
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {getMotivationMessage(currentStreak)}
          </Text>
          <Text style={styles.progressText}>
            {streakGoal - currentStreak} days until {streakGoal}-day streak!
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.longest_streak || 0}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.total_xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Continue Learning"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          <Button
            title="View Streak Details"
            variant="outline"
            onPress={handleViewStreak}
            style={styles.viewStreakButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function getMotivationMessage(streak: number): string {
  if (streak === 1) return "Great start! Keep it up!";
  if (streak < 5) return "You're building a habit!";
  if (streak < 10) return "Amazing consistency!";
  if (streak < 20) return "You're unstoppable!";
  if (streak < 30) return "Incredible dedication!";
  return "You're a learning legend!";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationHeader: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
  },
  celebrationTitle: {
    fontSize: Sizes.h1,
    fontWeight: "bold",
    color: Colors.background,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  celebrationSubtitle: {
    fontSize: Sizes.h3,
    color: Colors.background,
    textAlign: "center",
    opacity: 0.9,
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.warning,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.md,
    shadowColor: Colors.warning,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flameIcon: {
    fontSize: 48,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.background,
    marginBottom: Sizes.xs,
  },
  streakLabel: {
    fontSize: Sizes.h4,
    color: Colors.background,
    opacity: 0.9,
  },
  motivationContainer: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
  },
  motivationText: {
    fontSize: Sizes.h3,
    color: Colors.background,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: Sizes.sm,
  },
  progressText: {
    fontSize: Sizes.body,
    color: Colors.background,
    textAlign: "center",
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: Sizes.xxl,
    paddingHorizontal: Sizes.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: Sizes.h3,
    fontWeight: "bold",
    color: Colors.background,
    marginBottom: Sizes.xs,
  },
  statLabel: {
    fontSize: Sizes.caption,
    color: Colors.background,
    opacity: 0.8,
    textAlign: "center",
  },
  actionButtons: {
    width: "100%",
    gap: Sizes.md,
  },
  continueButton: {
    backgroundColor: Colors.background,
  },
  viewStreakButton: {
    borderColor: Colors.background,
    borderWidth: 2,
  },
});
