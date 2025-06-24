// App theme and colors
export const Colors = {
  primary: "#00C2D1", // Duolingo green
  secondary: "#F9E900", // Yellow for buttons and highlights
  tertiary: "#ED33B9", // Red for wrong answers
  quaternary: "#F6AF65", // Blue for tips and certain UI elements

  background: "#FFFFFF",
  card: "#F7F7F7",
  text: "#4B4B4B",
  textDark: "#3C3C3C",
  textLight: "#777777",
  border: "#E5E5E5",
  notification: "#FF3B30",

  success: "#58CC02",
  error: "#FF4B4B",
  warning: "#FFC800",
  info: "#1CB0F6",

  // Additional colors
  purple: "#CE82FF",
  orange: "#FF9600",
  darkBlue: "#0A4D82",
};

// Spaces and sizes
export const Sizes = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Font sizes
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,
};

// App-wide settings
export const AppConfig = {
  animationDuration: 300, // ms
  defaultLanguageFrom: "en", // English as base language
  availableLanguagesToLearn: ["ja", "es"], // Languages to learn
  maxDailyGoal: 50, // Max XP per day
  defaultDailyGoal: 20, // Default XP goal
  lessonXP: 10, // Standard XP earned per lesson
  practiceXP: 5, // XP earned from practice
};

// Language names for display
export const LanguageNames = {
  en: "English",
  ja: "Japanese",
};

// Exercise types
export const ExerciseTypes = {
  MULTIPLE_CHOICE: "multipleChoice",
  TYPE_ANSWER: "typeAnswer",
  MATCH_PAIRS: "matchPairs",
  SPEAKING: "speaking",
  LISTENING: "listening",
  ARRANGE_SENTENCE: "arrangeSentence",
};

// Achievement types
export const AchievementTypes = {
  STREAK: "streak",
  LESSONS_COMPLETED: "lessonsCompleted",
  PERFECT_LESSONS: "perfectLessons",
  WORDS_LEARNED: "wordsLearned",
  LEVEL_REACHED: "levelReached",
};
