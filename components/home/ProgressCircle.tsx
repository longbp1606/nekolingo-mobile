import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status?: "locked" | "in-progress" | "complete";
  unitId?: number;
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

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
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

const styles = StyleSheet.create({
  progressCircleContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
