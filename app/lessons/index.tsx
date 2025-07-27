import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ProgressBar } from "../../components";
import { Colors, Sizes } from "../../constants";
import { useGetCoursesQuery } from "../../services/courseApiService";
import { useGetTopicsByCourseQuery } from "../../services/topicApiService";

export default function LessonsScreen() {
  const router = useRouter();

  // Get courses first
  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCoursesQuery();

  // Get topics from the first course (or you can make this dynamic)
  const firstCourse = coursesResponse?.courses?.[0];
  const {
    data: topics,
    isLoading: topicsLoading,
    error: topicsError,
    refetch: refetchTopics,
  } = useGetTopicsByCourseQuery(firstCourse?._id || "", {
    skip: !firstCourse?._id,
  });

  const loading = coursesLoading || topicsLoading;
  const error = coursesError || topicsError;

  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.lessonItem}
      onPress={() => router.push(`/lessons/${item._id}` as any)}
    >
      <Card style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonLevel}>Order {item.order}</Text>
        </View>
        <Text style={styles.lessonDescription}>
          {item.description || "Learn this topic"}
        </Text>
        <View style={styles.lessonFooter}>
          <ProgressBar progress={0} style={styles.progressBar} />
          <Text style={styles.lessonXP}>+10 XP</Text>
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
          <Text style={styles.errorText}>
            {error ? "Failed to load lessons" : "No lessons available"}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetchTopics()}
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
        data={topics || []}
        renderItem={renderLesson}
        keyExtractor={(item) => item._id.toString()}
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
