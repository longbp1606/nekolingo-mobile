import { Ionicons } from "@expo/vector-icons";

export const getUnitColor = (unitId: number): string => {
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

export interface Lesson {
  icon: keyof typeof Ionicons.glyphMap;
  status: "locked" | "in-progress" | "complete";
  title: string;
  lessonId?: string;
}

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export const getLessonProps = (
  status: "locked" | "in-progress" | "complete"
) => {
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
