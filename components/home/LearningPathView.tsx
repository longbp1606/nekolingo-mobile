import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { Lesson, Unit } from "./types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface LearningPathViewProps {
  units: Unit[];
  onLessonPress: (lesson: Lesson, unitId: number) => void;
  currentUnit: Unit;
}

interface PathPoint {
  x: number;
  y: number;
  lessonIndex: number;
  unitIndex: number;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  units,
  onLessonPress,
  currentUnit,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Create pulsing animation for active lessons
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Generate winding path coordinates for all lessons
  const generatePathPoints = (): PathPoint[] => {
    const pathPoints: PathPoint[] = [];
    const startX = screenWidth * 0.2;
    const endX = screenWidth * 0.8;
    const amplitude = screenWidth * 0.25;

    let globalLessonIndex = 0;
    let currentY = 180; // Start lower to give space for unit headers

    units.forEach((unit, unitIndex) => {
      // Add space for unit header at the beginning of each unit
      if (unitIndex > 0) {
        currentY += 100; // Extra space between units for headers
      } else {
        currentY += 80; // Space for first unit header
      }

      unit.lessons.forEach((lesson, lessonIndex) => {
        const unitProgress =
          globalLessonIndex /
          Math.max(
            units.reduce((total, u) => total + u.lessons.length, 0) - 1,
            1
          );

        // Create S-curve effect with varying amplitude
        const wave = Math.sin(unitProgress * Math.PI * 4) * amplitude;
        const x = startX + (endX - startX) * 0.5 + wave;

        pathPoints.push({
          x: Math.max(80, Math.min(x, screenWidth - 80)),
          y: currentY,
          lessonIndex,
          unitIndex,
        });

        globalLessonIndex++;
        currentY += 120; // Space between lessons
      });
    });

    return pathPoints;
  };

  const pathPoints = generatePathPoints();

  // Generate SVG path string for the winding road
  const generateSVGPath = (): string => {
    if (pathPoints.length < 2) return "";

    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];

      // Create smooth curves between points
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.3;
      const cp2x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2y = prev.y + (curr.y - prev.y) * 0.7;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.status === "complete") return "checkmark-circle";
    if (lesson.status === "in-progress") return "play-circle";
    return "lock-closed";
  };

  const getLessonColors = (lesson: Lesson) => {
    switch (lesson.status) {
      case "complete":
        return {
          gradient: ["#4CAF50", "#66BB6A"],
          border: "#2E7D32",
          shadow: "#4CAF50",
          text: "#FFFFFF",
          glow: "#4CAF50",
        };
      case "in-progress":
        return {
          gradient: ["#FF9800", "#FFB74D"],
          border: "#F57C00",
          shadow: "#FF9800",
          text: "#FFFFFF",
          glow: "#FF9800",
        };
      default:
        return {
          gradient: ["#BDBDBD", "#E0E0E0"],
          border: "#757575",
          shadow: "#9E9E9E",
          text: "#424242",
          glow: "#BDBDBD",
        };
    }
  };

  const renderDecorations = () => {
    const decorations = [];
    const decorationItems = ["🌳", "🏠", "💬", "📚", "🎯", "⭐", "🚗", "🌸"];

    for (let i = 0; i < pathPoints.length; i += 3) {
      const point = pathPoints[i];
      const isLeft = point.x < screenWidth / 2;
      const decorationX = isLeft ? point.x + 100 : point.x - 100;
      const decorationY = point.y + (Math.random() - 0.5) * 80;

      decorations.push(
        <View
          key={`decoration-${i}`}
          style={[
            styles.decoration,
            {
              left: Math.max(20, Math.min(decorationX, screenWidth - 60)),
              top: decorationY,
            },
          ]}
        >
          <Text style={styles.decorationEmoji}>
            {decorationItems[i % decorationItems.length]}
          </Text>
        </View>
      );
    }

    return decorations;
  };

  const renderLessonNode = (point: PathPoint) => {
    const unit = units[point.unitIndex];
    const lesson = unit?.lessons[point.lessonIndex];

    if (!lesson || !unit) return null;

    const colors = getLessonColors(lesson);
    const isActive = lesson.status === "in-progress";
    const globalIndex = pathPoints.findIndex(
      (p) =>
        p.unitIndex === point.unitIndex && p.lessonIndex === point.lessonIndex
    );

    return (
      <TouchableOpacity
        key={`lesson-${point.unitIndex}-${point.lessonIndex}`}
        style={[
          styles.lessonNode,
          {
            left: point.x - 35,
            top: point.y - 35,
          },
        ]}
        onPress={() => onLessonPress(lesson, unit.id)}
        disabled={lesson.status === "locked"}
      >
        {/* Glow effect for completed lessons */}
        {lesson.status === "complete" && (
          <View
            style={[
              styles.glowRing,
              { backgroundColor: colors.glow, opacity: 0.3 },
            ]}
          />
        )}

        {/* Pulsing animation for active lesson */}
        {isActive && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: colors.shadow,
                transform: [{ scale: pulseAnim }],
                opacity: 0.4,
              },
            ]}
          />
        )}

        {/* Main lesson circle */}
        <View
          style={[
            styles.lessonCircle,
            {
              borderColor: colors.border,
              shadowColor: colors.shadow,
              backgroundColor: colors.gradient[0], // Use first color from gradient
            },
          ]}
        >
          <Ionicons
            name={getLessonIcon(lesson)}
            size={28}
            color={colors.text}
          />
        </View>

        {/* Lesson label */}
        <View style={styles.lessonLabel}>
          <Text style={styles.lessonNumber}>
            Bài {String(point.lessonIndex + 1)}
          </Text>
        </View>

        {/* XP reward badge */}
        {lesson.xpReward && lesson.status !== "locked" && (
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{String(lesson.xpReward || 0)}</Text>
          </View>
        )}

        {/* Lock icon overlay for locked lessons */}
        {lesson.status === "locked" && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={16} color="#757575" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderUnitHeaders = () => {
    const headers: React.ReactElement[] = [];

    units.forEach((unit, index) => {
      // Calculate position before first lesson of this unit
      const lessonsBeforeThisUnit = units
        .slice(0, index)
        .reduce((total, u) => total + u.lessons.length, 0);

      // Position unit header well before the first lesson of this unit
      // Start at 50 to give proper clearance from top, then calculate based on lessons and spacing
      let headerY = 50;
      if (index > 0) {
        headerY = 180 + lessonsBeforeThisUnit * 120 + (index - 1) * 100 + 20;
      }

      headers.push(
        <View
          key={`unit-header-${index}`}
          style={[styles.unitHeader, { top: headerY }]}
        >
          <View
            style={[styles.unitHeaderGradient, { backgroundColor: "#6C63FF" }]}
          >
            <Text style={styles.unitTitle}>
              Phần {String(index + 1)}, Bài {String(index + 1)}
            </Text>
            <Text style={styles.unitSubtitle}>{unit.subtitle || ""}</Text>
          </View>
        </View>
      );
    });

    return headers;
  };

  const renderProgressIndicator = () => {
    const totalLessons = units.reduce(
      (total, unit) => total + unit.lessons.length,
      0
    );
    const completedLessons = units.reduce(
      (total, unit) =>
        total + unit.lessons.filter((l) => l.status === "complete").length,
      0
    );
    const progressPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Tiến độ học tập</Text>
          <Text style={styles.progressPercent}>
            {String(Math.round(progressPercent))}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {String(completedLessons)}/{String(totalLessons)} bài học hoàn thành
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={[styles.background, { backgroundColor: "#E3F2FD" }]} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 10,
          minHeight: Math.max(
            pathPoints[pathPoints.length - 1]?.y + 200 || 1000,
            screenHeight
          ),
        }}
      >
        {/* Unit headers */}
        {renderUnitHeaders()}

        {/* Decorative elements */}
        {renderDecorations()}

        {/* Path SVG */}
        <Svg
          style={styles.pathSvg}
          width={screenWidth}
          height={Math.max(
            pathPoints[pathPoints.length - 1]?.y + 200 || 1000,
            screenHeight
          )}
        >
          <Defs>
            <SvgLinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#B0BEC5" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#78909C" stopOpacity="0.6" />
            </SvgLinearGradient>
          </Defs>

          {/* Path shadow */}
          <Path
            d={generateSVGPath()}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            transform="translate(2,4)"
          />

          {/* Main path */}
          <Path
            d={generateSVGPath()}
            stroke="url(#pathGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="15,8"
          />

          {/* Path centerline */}
          <Path
            d={generateSVGPath()}
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>

        {/* Lesson nodes */}
        {pathPoints.map((point) => renderLessonNode(point))}

        {/* Progress indicator at bottom */}
        {/* {renderProgressIndicator()} */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  pathSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  unitHeader: {
    position: "absolute",
    left: 30,
    right: 30,
    zIndex: 15, // Higher than lesson nodes to appear on top
    marginBottom: 20,
  },
  unitHeaderGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  unitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  unitSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  decoration: {
    position: "absolute",
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  decorationEmoji: {
    fontSize: 28,
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lessonNode: {
    position: "absolute",
    alignItems: "center",
    zIndex: 12, // Lower than unit headers but higher than decorations
    width: 70,
    height: 70,
  },
  glowRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -10,
    left: -10,
  },
  pulseRing: {
    position: "absolute",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    top: -7.5,
    left: -7.5,
  },
  lessonCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  lessonLabel: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 50,
    alignItems: "center",
  },
  lessonNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2C3E50",
  },
  xpBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#9C27B0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  xpText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  lockOverlay: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    margin: 20,
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: "#636e72",
    textAlign: "center",
    fontWeight: "500",
  },
});
