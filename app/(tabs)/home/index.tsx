import LessonModal from "@/components/LessonModal";
import StatsBar from "@/components/StatsBar";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import {
  ErrorState,
  getUnitColor,
  HomeHeader,
  LearningPathView,
  Lesson,
  LoadingState,
  Unit,
} from "../../../components/home";
import { useAuth } from "../../../hooks/useAuth";
import { useHearts } from "../../../hooks/useHearts";
import {
  useGetCourseMetadataQuery,
  useGetCoursesQuery,
} from "../../../services/courseApiService";

// Helper function to create units from course metadata
const createUnitsFromCourseMetadata = (
  courseMetadata: any,
  user: any
): Unit[] => {
  if (!courseMetadata?.topics || courseMetadata.topics.length === 0) {
    return [];
  }

  const topics = courseMetadata.topics;
  const currentLessonId = user?.currentLesson || "";
  const currentTopicId = user?.currentTopic || "";

  // Group topics into units (for now, we'll create one unit per topic)
  const units: Unit[] = topics.map((topic: any, index: number) => {
    const lessons: Lesson[] =
      topic.lessons?.map((lesson: any, lessonIndex: number) => {
        let status: "complete" | "in-progress" | "locked";

        // Determine lesson status based on current lesson/topic from user profile
        if (currentLessonId === lesson._id && currentTopicId === topic._id) {
          status = "in-progress";
        } else if (currentTopicId === topic._id) {
          // Find current lesson in this topic
          const currentLesson = topic.lessons.find(
            (l: any) => l._id === currentLessonId
          );
          if (currentLesson && currentLesson.order > lesson.order) {
            status = "complete";
          } else if (currentLesson && currentLesson.order < lesson.order) {
            status = "locked";
          } else {
            // If no current lesson in this topic, first lesson is available
            status = lesson.order === 1 ? "in-progress" : "locked";
          }
        } else {
          // Different topic - check if this topic comes before current topic
          const currentTopic = topics.find(
            (t: any) => t._id === currentTopicId
          );
          if (currentTopic && topic.order < currentTopic.order) {
            status = "complete";
          } else if (!currentTopicId && index === 0 && lesson.order === 1) {
            // No current topic set, first lesson of first topic is available
            status = "in-progress";
          } else {
            status = "locked";
          }
        }

        // Choose icon based on lesson type and mode
        let icon = "star"; // default
        if (lesson.mode === "personalized") {
          icon = "sparkles"; // Special icon for AI-generated lessons
        } else if (lesson.type?.includes("vocabulary")) {
          icon = "book";
        } else if (lesson.type?.includes("grammar")) {
          icon = "school";
        } else if (lesson.type?.includes("reading")) {
          icon = "document-text";
        } else {
          const icons = ["star", "checkmark-circle", "trophy", "flag"];
          icon = icons[lessonIndex % icons.length];
        }

        // Truncate long lesson titles for better display
        const safeTitle = String(lesson.title || "");
        const displayTitle =
          safeTitle.length > 35
            ? safeTitle.substring(0, 32) + "..."
            : safeTitle;

        return {
          icon: icon as any,
          status,
          title: displayTitle,
          lessonId: lesson._id,
          xpReward: lesson.xp_reward,
          lessonType: Array.isArray(lesson.type)
            ? lesson.type
            : lesson.type
            ? [lesson.type]
            : undefined,
          mode: lesson.mode,
          originalTitle: safeTitle, // Keep full title for modal/details
        };
      }) || [];

    return {
      id: index + 1,
      title: `Section ${index + 1}, Unit ${index + 1}`,
      subtitle: String(topic.title || ""),
      lessons,
    };
  });

  return units;
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { handleHeartCheck } = useHearts();

  // Fallback: get courses if user doesn't have currentCourse set
  const { data: coursesResponse, isLoading: coursesLoading } =
    useGetCoursesQuery(undefined, {
      skip: !!user?.currentCourse, // Skip if user already has a current course
    });

  // Determine which course to use
  const courseId =
    user?.currentCourse || coursesResponse?.courses?.[0]?._id || "";

  // Get course metadata using determined course ID
  const {
    data: courseMetadata,
    isLoading: metadataLoading,
    error: metadataError,
  } = useGetCourseMetadataQuery(courseId, {
    skip: !courseId,
  });

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState(1);

  // Create units data from course metadata
  const units = createUnitsFromCourseMetadata(courseMetadata, user);

  // Debug: Log the data structure
  useEffect(() => {
    if (courseMetadata) {
      console.log("Course Metadata:", JSON.stringify(courseMetadata, null, 2));
      console.log("User current state:", {
        currentCourse: user?.currentCourse,
        currentTopic: user?.currentTopic,
        currentLesson: user?.currentLesson,
      });
      console.log("Generated units:", units.length);
    }
  }, [courseMetadata, user]);

  const [currentUnit, setCurrentUnit] = useState(
    units[0] || {
      id: 1,
      title: "Unit 1",
      subtitle: "Get started",
      lessons: [],
    }
  );

  // Update current unit when units change
  useEffect(() => {
    if (
      units.length > 0 &&
      (!currentUnit || currentUnit.lessons.length === 0)
    ) {
      setCurrentUnit(units[0]);
    }
  }, [units]);

  // Loading state
  if (metadataLoading || coursesLoading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Đang tải dữ liệu khóa học..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (metadataError || !courseId) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Lỗi khi tải dữ liệu khóa học. Vui lòng thử lại." />
      </SafeAreaView>
    );
  }

  // Navigation helper
  const navigateToLesson = (lessonId: string) => {
    if (!lessonId) {
      console.warn("No lesson ID provided");
      return;
    }

    try {
      router.push(`/lessons/${lessonId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // Try alternative navigation methods if needed
      try {
        router.push({
          pathname: "/lessons/[id]",
          params: { id: lessonId },
        });
      } catch (error2) {
        console.error("All navigation methods failed:", error2);
      }
    }
  };

  // Handle scroll to track current unit
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const unitHeight = 1000;
    const unitIndex = Math.floor(scrollY / unitHeight);

    if (
      unitIndex >= 0 &&
      unitIndex < units.length &&
      units[unitIndex].id !== currentUnit.id
    ) {
      setCurrentUnit(units[unitIndex]);
    }
  };

  // Handle lesson press
  const handleLessonPress = (lesson: Lesson, unitId: number) => {
    setSelectedLesson(lesson);
    setSelectedUnitId(unitId);
    setModalVisible(true);
  };

  // Handle lesson start from modal
  const handleStartLesson = (lessonId: string) => {
    setModalVisible(false);
    if (lessonId) {
      // Check hearts before navigation
      handleHeartCheck(() => {
        navigateToLesson(lessonId);
      });
    } else {
      console.warn("Cannot start lesson: No lesson ID provided");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: getUnitColor(currentUnit?.id || 1) },
      ]}
    >
      <StatsBar />

      <HomeHeader
        title={currentUnit?.title || "Unit 1"}
        subtitle={currentUnit?.subtitle || "Get started"}
        backgroundColor={getUnitColor(currentUnit?.id || 1)}
        onListPress={() => router.push("/lessons")}
        userLevel={user?.currentLevel}
        userName={user?.username}
      />

      <LearningPathView
        units={units || []}
        onLessonPress={handleLessonPress}
        currentUnit={
          currentUnit || {
            id: 1,
            title: "Unit 1",
            subtitle: "Get started",
            lessons: [],
          }
        }
      />

      <LessonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        lesson={selectedLesson || { icon: "star", status: "locked", title: "" }}
        unitId={selectedUnitId}
        onStartLesson={handleStartLesson}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
