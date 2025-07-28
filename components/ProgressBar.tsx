import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../constants";

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const ProgressBar = ({
  progress,
  height = 8,
  color = Colors.primary,
  backgroundColor = Colors.border,
  style,
}: ProgressBarProps) => {
  // Ensure progress is between 0 and 1
  const validProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${validProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
});

export default ProgressBar;
