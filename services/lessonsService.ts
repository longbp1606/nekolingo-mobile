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

// Helper function to generate mock exercises - FIXED VERSION
function generateMockExercises(count: number, language: string): Exercise[] {
  const exercises: Exercise[] = [];

  const questionTemplates = [
    "Translate this sentence",
    "Choose the correct meaning",
    "What is this in English?",
    "Complete this sentence",
  ];

  // Enhanced vocabulary with English translations
  const vocabularyData = {
    ja: [
      { word: "こんにちは", english: "Hello", wrong: ["Goodbye", "Thank you", "Please"] },
      { word: "ありがとう", english: "Thank you", wrong: ["Hello", "Goodbye", "Please"] },
      { word: "水", english: "Water", wrong: ["Fire", "Earth", "Air"] },
      { word: "猫", english: "Cat", wrong: ["Dog", "Bird", "Fish"] },
      { word: "犬", english: "Dog", wrong: ["Cat", "Horse", "Pig"] },
      { word: "本", english: "Book", wrong: ["Pen", "Paper", "Desk"] },
      { word: "車", english: "Car", wrong: ["Train", "Bus", "Bike"] },
      { word: "家", english: "House", wrong: ["School", "Store", "Park"] },
      { word: "食べる", english: "To eat", wrong: ["To drink", "To sleep", "To walk"] },
      { word: "飲む", english: "To drink", wrong: ["To eat", "To run", "To read"] },
    ],
    es: [
      { word: "hola", english: "Hello", wrong: ["Goodbye", "Thank you", "Please"] },
      { word: "gracias", english: "Thank you", wrong: ["Hello", "Goodbye", "Please"] },
      { word: "agua", english: "Water", wrong: ["Fire", "Earth", "Air"] },
      { word: "gato", english: "Cat", wrong: ["Dog", "Bird", "Fish"] },
      { word: "perro", english: "Dog", wrong: ["Cat", "Horse", "Pig"] },
      { word: "libro", english: "Book", wrong: ["Pen", "Paper", "Desk"] },
      { word: "coche", english: "Car", wrong: ["Train", "Bus", "Bike"] },
      { word: "casa", english: "House", wrong: ["School", "Store", "Park"] },
      { word: "comer", english: "To eat", wrong: ["To drink", "To sleep", "To walk"] },
      { word: "beber", english: "To drink", wrong: ["To eat", "To run", "To read"] },
    ]
  };

  const vocabulary = vocabularyData[language as keyof typeof vocabularyData] || vocabularyData.ja;

  for (let i = 0; i < count; i++) {
    const exerciseType = ExerciseTypes.MULTIPLE_CHOICE; // Force all to be multiple choice for consistency
    const questionTemplate = questionTemplates[i % questionTemplates.length];
    const vocabItem = vocabulary[i % vocabulary.length];

    const exercise: Exercise = {
      id: `exercise-${i + 1}`,
      type: exerciseType,
      question: `${questionTemplate}: "${vocabItem.word}"`,
      correctAnswer: vocabItem.english,
    };

    // Always create options for multiple choice questions
    if (exerciseType === ExerciseTypes.MULTIPLE_CHOICE) {
      // Shuffle the options to make it more realistic
      const allOptions = [vocabItem.english, ...vocabItem.wrong];
      exercise.options = shuffleArray(allOptions);
    }

    // Add some hints
    if (i % 3 === 0) {
      exercise.hints = [`This is a common ${language === 'ja' ? 'Japanese' : 'Spanish'} word you might use daily.`];
    }

    exercises.push(exercise);
  }

  return exercises;
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default lessonsService;


