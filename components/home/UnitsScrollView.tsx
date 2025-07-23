import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Lesson } from "./LessonCircle";
import { Unit, UnitContainer } from "./UnitContainer";

interface UnitsScrollViewProps {
  units: Unit[];
  onScroll: (event: any) => void;
  onLessonPress: (lesson: Lesson, unitId: number) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export const UnitsScrollView: React.FC<UnitsScrollViewProps> = ({
  units,
  onScroll,
  onLessonPress,
  scrollViewRef,
}) => {
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.content}>
        {units.map((unit, unitIndex) => (
          <UnitContainer
            key={unit.id}
            unit={unit}
            isLastUnit={unitIndex === units.length - 1}
            onLessonPress={onLessonPress}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});
