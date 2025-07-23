import LessonModal from "@/components/LessonModal";
import StatsBar from "@/components/StatsBar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useGetCoursesQuery } from "../../../services/courseApiService";
import { useGetTopicsByCourseQuery } from "../../../services/topicApiService";

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status?: "locked" | "in-progress" | "complete";
  unitId?: number;
}

interface Lesson {
  icon: keyof typeof Ionicons.glyphMap;
  status: "locked" | "in-progress" | "complete";
  title: string;
  lessonId?: string;
}

interface Unit {
  id: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

interface LessonCircleProps {
  icon: keyof typeof Ionicons.glyphMap;
  status?: "locked" | "in-progress" | "complete";
  progress?: number;
  size?: number;
  unitId?: number;
  title?: string;
  onPress?: () => void;
}

const getUnitColor = (unitId: number) => {
  const colors: { [key: number]: string } = {
    1: "#00C2D1",
    2: "#4CAF50",
    3: "#9069CD",
    4: "#A5ED6E",
    5: "#2B70C9",
    6: "#6F4EA1",
    7: "#1453A3",
    8: "#A56644",
  };
  return colors[unitId] || "#00C2D1";
};

const getLessonProps = (status: "locked" | "in-progress" | "complete") => {
  switch (status) {
    case "locked":
      return { progress: 0, size: 60 };
    case "in-progress":
      return { progress: 10, size: 70 };
    case "complete":
      return { progress: 100, size: 80 };
    default:
      return { progress: 0, size: 60 };
  }
};

const { width } = Dimensions.get("window");

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 90,
  strokeWidth = 4,
  status = "locked",
  unitId = 1,
}) => {
  let strokeColor = "#e0e0e0";
  if (status === "complete") strokeColor = getUnitColor(unitId);
  else if (status === "in-progress") strokeColor = "#FFD700";

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={[styles.progressCircleContainer, { width: size, height: size }]}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
        />
        {progress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
    </View>
  );
};

const LessonCircle: React.FC<LessonCircleProps> = ({
  icon,
  status = "locked",
  progress = 0,
  size = 70,
  unitId = 1,
  title = "",
  onPress,
}) => {
  const getCircleStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      position: "relative" as const,
    };

    switch (status) {
      case "complete":
        return [
          baseStyle,
          styles.completeCircle,
          {
            backgroundColor: getUnitColor(unitId),
          },
        ];
      case "in-progress":
        return [
          baseStyle,
          styles.inProgressCircle,
          {
            backgroundColor: "#FFD700",
          },
        ];
      default:
        return [
          baseStyle,
          styles.lockedCircle,
          {
            backgroundColor: "#e5e5e5",
          },
        ];
    }
  };

  const getIconColor = () => {
    switch (status) {
      case "complete":
        return "white";
      case "in-progress":
        return "white";
      default:
        return "#999";
    }
  };

  return (
    <View style={styles.lessonContainer}>
      <View
        style={[styles.lessonWrapper, { width: size + 20, height: size + 20 }]}
      >
        <ProgressCircle
          progress={progress}
          size={size + 20}
          status={status}
          unitId={unitId}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={getCircleStyle()}
            activeOpacity={0.8}
            onPress={onPress}
          >
            <View
              style={[
                styles.topHighlight,
                {
                  width: size - 10,
                  height: (size - 10) / 2,
                  borderRadius: (size - 10) / 2,
                  top: 5,
                },
              ]}
            />

            <Ionicons
              name={icon}
              size={size * 0.4}
              color={getIconColor()}
              style={{ zIndex: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  // Use RTK Query hooks
  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCoursesQuery();
  const courses = coursesResponse?.courses || [];

  // Get the first course for now (you might want to let user select)
  const selectedCourse = courses[0];

  const {
    data: topics,
    isLoading: topicsLoading,
    error: topicsError,
  } = useGetTopicsByCourseQuery(selectedCourse?._id || "", {
    skip: !selectedCourse,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{
    icon: keyof typeof Ionicons.glyphMap;
    status: "locked" | "in-progress" | "complete";
    title: string;
    lessonId?: string;
  } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Loading state
  if (coursesLoading || topicsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (coursesError || topicsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error loading data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const units: Unit[] = [
    {
      id: 1,
      title: "Unit 1",
      subtitle: "Use basic phrases, greet people",
      lessons: [
        // First 3 lessons use real data from topics (you can map topics to lessons)
        {
          icon: "star",
          status: "complete",
          title: topics?.[0]?.title || "Chào hỏi cơ bản",
          lessonId: topics?.[0]?._id || undefined,
        },
        {
          icon: "checkmark-circle",
          status: "complete",
          title: topics?.[1]?.title || "Giới thiệu bản thân",
          lessonId: topics?.[1]?._id || undefined,
        },
        {
          icon: "barbell",
          status: "in-progress",
          title: topics?.[2]?.title || "Dùng thì hiện tại để diễn tả cảm xúc",
          lessonId: topics?.[2]?._id || undefined,
        },
        // Rest are fake data
        {
          icon: "lock-closed",
          status: "locked",
          title: "Hỏi thông tin cá nhân",
        },
        { icon: "book", status: "locked", title: "Từ vựng gia đình" },
        { icon: "trophy", status: "locked", title: "Bài tập tổng hợp" },
        { icon: "school", status: "locked", title: "Học từ vựng mở rộng" },
        { icon: "flag", status: "locked", title: "Kiểm tra cuối bài" },
      ],
    },
    {
      id: 2,
      title: "Unit 2",
      subtitle: "Talk about family and friends",
      lessons: [
        {
          icon: "people",
          status: "complete",
          title: "Câu chuyện: Câu hỏi của Junior",
        },
        { icon: "heart", status: "in-progress", title: "Nói về tình cảm" },
        { icon: "home", status: "locked", title: "Mô tả ngôi nhà" },
        { icon: "gift", status: "locked", title: "Tặng quà và lời chúc" },
        { icon: "camera", status: "locked", title: "Chia sẻ kỷ niệm" },
        { icon: "balloon", status: "locked", title: "Tổ chức tiệc tùng" },
        { icon: "musical-notes", status: "locked", title: "Âm nhạc yêu thích" },
        { icon: "star", status: "locked", title: "Bài tập cuối khóa" },
      ],
    },
    {
      id: 3,
      title: "Unit 3",
      subtitle: "Describe places and directions",
      lessons: [
        { icon: "map", status: "complete", title: "Đọc bản đồ" },
        { icon: "compass", status: "in-progress", title: "Hướng dẫn đường đi" },
        { icon: "car", status: "locked", title: "Phương tiện giao thông" },
        { icon: "airplane", status: "locked", title: "Du lịch máy bay" },
        { icon: "train", status: "locked", title: "Đi tàu hỏa" },
        { icon: "walk", status: "locked", title: "Đi bộ trong thành phố" },
        { icon: "restaurant", status: "locked", title: "Tìm nhà hàng" },
        { icon: "storefront", status: "locked", title: "Mua sắm" },
      ],
    },
  ];

  const [currentUnit, setCurrentUnit] = useState(units[0]);

  const navigateToLesson = (lessonId: string) => {
    try {
      router.push(`/lessons/${lessonId}`);
    } catch (error) {
      console.error("Navigation error (method 1):", error);

      try {
        router.push({
          pathname: "/lessons/[id]",
          params: { id: lessonId },
        });
      } catch (error2) {
        console.error("Navigation error (method 2):", error2);

        try {
          router.navigate(`/lessons/${lessonId}`);
        } catch (error3) {
          console.error("Navigation error (method 3):", error3);

          try {
            router.push(`/lessons/${lessonId}`);
          } catch (error4) {
            console.error("All navigation methods failed:", error4);
          }
        }
      }
    }
  };

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

  const handleLessonPress = (lesson: Lesson, unitId: number) => {
    setSelectedLesson(lesson);
    setSelectedUnitId(unitId);
    setModalVisible(true);
  };

  const getSCurvePosition = (index: number) => {
    const centerX = width / 2;
    const amplitude = 80;
    const verticalSpacing = 120;

    const y = index * verticalSpacing + 50;
    const normalizedIndex = index / 7;
    const x = centerX + amplitude * Math.sin(normalizedIndex * Math.PI * 2.5);

    return { x: x - 40, y };
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: getUnitColor(currentUnit.id) },
      ]}
    >
      <StatsBar />

      <View
        style={[
          styles.header,
          { backgroundColor: getUnitColor(currentUnit.id) },
        ]}
      >
        <Text style={styles.headerTitle}>{currentUnit.title}</Text>
        <Text style={styles.headerSubtitle}>{currentUnit.subtitle}</Text>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => router.push("/lessons")}
        >
          <Ionicons name="list" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {units.map((unit, unitIndex) => (
            <View key={unit.id} style={styles.unitContainer}>
              <View style={styles.lessonsContainer}>
                {unit.lessons.map((lesson, lessonIndex) => {
                  const position = getSCurvePosition(lessonIndex);
                  const { progress, size } = getLessonProps(lesson.status);
                  return (
                    <View
                      key={lessonIndex}
                      style={[
                        styles.lessonPositioned,
                        {
                          left: position.x,
                          top: position.y,
                        },
                      ]}
                    >
                      <LessonCircle
                        icon={lesson.icon}
                        status={lesson.status}
                        progress={progress}
                        size={size}
                        unitId={unit.id}
                        title={lesson.title}
                        onPress={() => handleLessonPress(lesson, unit.id)}
                      />
                    </View>
                  );
                })}
              </View>
              {unitIndex < units.length - 1 && (
                <View style={styles.unitDivider} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <LessonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        lesson={selectedLesson || { icon: "star", status: "locked", title: "" }}
        unitId={selectedUnitId}
        onStartLesson={(lessonId) => {
          setModalVisible(false);
          navigateToLesson(lessonId);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    position: "relative",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "white",
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  bookmarkButton: {
    position: "absolute",
    right: 20,
    top: 25,
    padding: 10,
    borderRadius: 12,
    borderColor: "#fff",
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    paddingBottom: 50,
    minHeight: 2500,
  },
  unitContainer: {
    height: 1000,
    marginBottom: 50,
    width: "100%",
  },
  unitDivider: {
    position: "absolute",
    bottom: -40,
    left: 40,
    width: "80%",
    height: 2,
    backgroundColor: "#ddd",
    borderRadius: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // Start Button
  startButtonContainer: {
    position: "relative",
    marginBottom: 40,
  },
  startButtonShadow: {
    position: "absolute",
    bottom: -8,
    left: 4,
    width: 120,
    height: 20,
    backgroundColor: "#58CC02",
    borderRadius: 25,
    zIndex: -1,
  },
  startButton: {
    backgroundColor: "#00C2D1",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    position: "relative",
    overflow: "hidden",
  },
  startButtonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
  },
  startText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    zIndex: 10,
  },

  // Active Circle
  activeCircleContainer: {
    position: "relative",
    marginBottom: 50,
  },
  activeCircleShadow: {
    position: "absolute",
    bottom: -12,
    left: 6,
    width: 80,
    height: 25,
    backgroundColor: "#58CC02",
    borderRadius: 40,
    zIndex: -1,
  },
  activeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00C2D1",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  activeCircleHighlight: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 70,
    height: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 35,
  },

  // Lesson Components
  lessonsContainer: {
    position: "relative",
    width: "100%",
    height: 1200,
  },
  lessonPositioned: {
    position: "absolute",
  },
  lessonContainer: {
    alignItems: "center",
  },
  lessonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  buttonContainer: {
    position: "relative",
  },

  completeCircle: {
    backgroundColor: "#00C2D1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  inProgressCircle: {
    backgroundColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  lockedCircle: {
    backgroundColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  topHighlight: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 1,
  },

  // Progress Circle Styles
  progressCircleContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading and Error Styles
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

export default HomeScreen;
