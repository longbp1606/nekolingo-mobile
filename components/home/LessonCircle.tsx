import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ProgressCircle } from "./ProgressCircle";

export interface Lesson {
  icon: keyof typeof Ionicons.glyphMap;
  status: "locked" | "in-progress" | "complete";
  title: string;
  lessonId?: string;
}

interface LessonCircleProps {
  lesson: Lesson;
  progress?: number;
  size?: number;
  unitId?: number;
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

export const LessonCircle: React.FC<LessonCircleProps> = ({
  lesson,
  progress = 0,
  size = 70,
  unitId = 1,
  onPress,
}) => {
  const { icon, status } = lesson;

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

const styles = StyleSheet.create({
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
});
