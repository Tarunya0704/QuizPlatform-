export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface Attempt {
    id?: number;
    date: string;
    score: number;
    totalQuestions: number;
    percentage: string;
    timestamp: number;
  }