import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
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

export default function LessonsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { lessons, loading, error } = useSelector(
    (state: RootState) => state.lessons
  );

  useEffect(() => {
    dispatch(fetchLessons("ja")); // Default to Japanese for now
  }, [dispatch]);

  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.lessonItem}
      onPress={() => router.push(`/lessons/${item.id}` as any)}
    >
      <Card style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonLevel}>Level {item.level}</Text>
        </View>
        <Text style={styles.lessonDescription}>{item.description}</Text>
        <View style={styles.lessonFooter}>
          <ProgressBar progress={item.progress} style={styles.progressBar} />
          <Text style={styles.lessonXP}>+{item.xpReward} XP</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lessons</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lessons</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button
            title="Try Again"
            onPress={() => dispatch(fetchLessons("ja"))}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Lessons</Text>
      </View>

      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.sm,
  },
  backButton: {
    padding: Sizes.sm,
    marginRight: Sizes.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  list: {
    paddingHorizontal: Sizes.md,
    paddingBottom: Sizes.xl,
  },
  lessonItem: {
    marginBottom: Sizes.md,
  },
  lessonCard: {
    padding: Sizes.md,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  lessonTitle: {
    fontSize: Sizes.h4,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  lessonLevel: {
    fontSize: Sizes.caption,
    color: Colors.primary,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    marginBottom: Sizes.md,
    lineHeight: 20,
  },
  lessonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    marginRight: Sizes.md,
  },
  lessonXP: {
    fontSize: Sizes.caption,
    color: Colors.warning,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
  },
  errorText: {
    fontSize: Sizes.body,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Sizes.md,
  },
  retryButton: {
    marginTop: Sizes.md,
  },
});
