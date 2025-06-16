import { ExerciseTypes } from "../constants";

// Types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  language: string;
  level: number;
  exercises: Exercise[];
  isCompleted: boolean;
  xpReward: number;
  imageUrl?: string;
}

export interface Exercise {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  hints?: string[];
  imageUrl?: string;
  audioUrl?: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  totalExercises: number;
  correctAnswers: number;
  date: string;
}

const lessonsService = {
  getLessons: async (language: string): Promise<Lesson[]> => {
    // For demo purposes, we'll return mock data
    // In a real app:
    // const response = await axios.get(`${API_BASE_URL}/lessons?language=${language}`);
    // return response.data;

    // Mock data
    return [
      {
        id: "1",
        title: "Basics 1",
        description: "Learn the most common words and phrases",
        language: language,
        level: 1,
        isCompleted: true,
        xpReward: 10,
        imageUrl: "https://example.com/basics1.png",
        exercises: generateMockExercises(8, language),
      },
      {
        id: "2",
        title: "Greetings",
        description: "Learn how to greet people and introduce yourself",
        language: language,
        level: 1,
        isCompleted: false,
        xpReward: 10,
        imageUrl: "https://example.com/greetings.png",
        exercises: generateMockExercises(10, language),
      },
      {
        id: "3",
        title: "Food",
        description: "Learn vocabulary related to food and restaurants",
        language: language,
        level: 2,
        isCompleted: false,
        xpReward: 15,
        imageUrl: "https://example.com/food.png",
        exercises: generateMockExercises(12, language),
      },
    ];
  },

  getLesson: async (id: string): Promise<Lesson> => {
    // For demo purposes
    // const response = await axios.get(`${API_BASE_URL}/lessons/${id}`);
    // return response.data;

    // Mock data
    return {
      id,
      title: `Lesson ${id}`,
      description: "Learn essential vocabulary",
      language: "ja",
      level: 1,
      isCompleted: false,
      xpReward: 10,
      exercises: generateMockExercises(10, "ja"),
    };
  },

  submitLessonResult: async (
    lessonId: string,
    results: { exerciseId: string; isCorrect: boolean }[]
  ): Promise<LessonProgress> => {
    // For demo purposes
    // const response = await axios.post(`${API_BASE_URL}/lessons/${lessonId}/submit`, { results });
    // return response.data;

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const totalExercises = results.length;
    const score = Math.round((correctAnswers / totalExercises) * 100);

    return {
      lessonId,
      completed: true,
      score,
      totalExercises,
      correctAnswers,
      date: new Date().toISOString(),
    };
  },

  getLessonProgress: async (userId: string): Promise<LessonProgress[]> => {
    // For demo purposes
    // const response = await axios.get(`${API_BASE_URL}/users/${userId}/progress`);
    // return response.data;

    return [
      {
        lessonId: "1",
        completed: true,
        score: 90,
        totalExercises: 10,
        correctAnswers: 9,
        date: "2025-06-15T12:00:00Z",
      },
    ];
  },
};

// Helper function to generate mock exercises
function generateMockExercises(count: number, language: string): Exercise[] {
  const exercises: Exercise[] = [];

  const questionTemplates = [
    "Translate this sentence",
    "Choose the correct meaning",
    "What is this in English?",
    "Complete this sentence",
  ];

  const japaneseWords = [
    "こんにちは",
    "ありがとう",
    "水",
    "猫",
    "犬",
    "本",
    "車",
    "家",
    "食べる",
    "飲む",
  ];
  const spanishWords = [
    "hola",
    "gracias",
    "agua",
    "gato",
    "perro",
    "libro",
    "coche",
    "casa",
    "comer",
    "beber",
  ];

  const words = language === "ja" ? japaneseWords : spanishWords;

  for (let i = 0; i < count; i++) {
    const exerciseType =
      Object.values(ExerciseTypes)[i % Object.values(ExerciseTypes).length];
    const questionTemplate = questionTemplates[i % questionTemplates.length];
    const word = words[i % words.length];

    const exercise: Exercise = {
      id: `exercise-${i + 1}`,
      type: exerciseType,
      question: `${questionTemplate}: "${word}"`,
      correctAnswer: word,
    };

    if (exerciseType === ExerciseTypes.MULTIPLE_CHOICE) {
      exercise.options = [
        word,
        words[(i + 1) % words.length],
        words[(i + 2) % words.length],
        words[(i + 3) % words.length],
      ];
    }

    exercises.push(exercise);
  }

  return exercises;
}

export default lessonsService;
