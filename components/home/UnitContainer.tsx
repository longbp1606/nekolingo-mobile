import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Lesson, LessonCircle } from "./LessonCircle";

const { width } = Dimensions.get("window");

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

interface UnitContainerProps {
  unit: Unit;
  isLastUnit: boolean;
  onLessonPress: (lesson: Lesson, unitId: number) => void;
}

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

const getSCurvePosition = (index: number) => {
  const centerX = width / 2;
  const amplitude = 80;
  const verticalSpacing = 120;

  const y = index * verticalSpacing + 50;
  const normalizedIndex = index / 7;
  const x = centerX + amplitude * Math.sin(normalizedIndex * Math.PI * 2.5);

  return { x: x - 40, y };
};

export const UnitContainer: React.FC<UnitContainerProps> = ({
  unit,
  isLastUnit,
  onLessonPress,
}) => {
  return (
    <View style={styles.unitContainer}>
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
                lesson={lesson}
                progress={progress}
                size={size}
                unitId={unit.id}
                onPress={() => onLessonPress(lesson, unit.id)}
              />
            </View>
          );
        })}
      </View>
      {!isLastUnit && <View style={styles.unitDivider} />}
    </View>
  );
};

const styles = StyleSheet.create({
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
  lessonsContainer: {
    position: "relative",
    width: "100%",
    height: 1200,
  },
  lessonPositioned: {
    position: "absolute",
  },
});
