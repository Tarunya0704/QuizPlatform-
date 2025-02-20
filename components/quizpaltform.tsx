"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Timer, Trophy } from 'lucide-react';
import type { Question, Attempt } from '@/types';

// IndexedDB setup with TypeScript
const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open('QuizDB', 1);

    request.onerror = () => {
      reject('Error opening database');
    };

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBOpenDBRequest;
      resolve(target.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const target = event.target as IDBOpenDBRequest;
      const db = target.result;
      if (!db.objectStoreNames.contains('attempts')) {
        db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Sample questions
const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4"
  }
];

const QuizPlatform: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [db, setDB] = useState<IDBDatabase | null>(null);

  // Load attempts from IndexedDB
  const loadAttempts = useCallback(async (database: IDBDatabase) => {
    const transaction = database.transaction(['attempts'], 'readonly');
    const store = transaction.objectStore('attempts');
    const request = store.getAll();

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBRequest;
      setAttempts(target.result as Attempt[]);
    };
  }, []);

  // Initialize IndexedDB
  useEffect(() => {
    const setupDB = async () => {
      try {
        const database = await initializeDB();
        setDB(database);
        await loadAttempts(database);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    setupDB();
  }, [loadAttempts]);

  // Save attempt to IndexedDB
  const saveAttempt = useCallback(async (attempt: Omit<Attempt, 'id'>) => {
    if (!db) return;

    const transaction = db.transaction(['attempts'], 'readwrite');
    const store = transaction.objectStore('attempts');
    const request = store.add(attempt);

    request.onsuccess = () => {
      loadAttempts(db);
    };

    request.onerror = () => {
      console.error('Error saving attempt');
    };
  }, [db, loadAttempts]);

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(30);
    } else {
      const newAttempt = {
        date: new Date().toLocaleString(),
        score,
        totalQuestions: sampleQuestions.length,
        percentage: ((score / sampleQuestions.length) * 100).toFixed(1),
        timestamp: Date.now()
      };
      saveAttempt(newAttempt);
      setShowScore(true);
    }
  }, [currentQuestion, score, saveAttempt]);

  useEffect(() => {
    if (timeLeft > 0 && !showScore) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showScore) {
      handleNextQuestion();
    }
  }, [timeLeft, showScore, handleNextQuestion]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (answer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  }, [currentQuestion, handleNextQuestion]);

  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  const clearHistory = useCallback(async () => {
    if (!db) return;

    const transaction = db.transaction(['attempts'], 'readwrite');
    const store = transaction.objectStore('attempts');
    const request = store.clear();

    request.onsuccess = () => {
      setAttempts([]);
    };
  }, [db]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Interactive Quiz</span>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span>{timeLeft}s</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showScore ? (
            <div className="space-y-6">
              <div className="text-lg font-medium">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </div>
              <div className="text-xl">
                {sampleQuestions[currentQuestion].question}
              </div>
              <div className="grid gap-3">
                {sampleQuestions[currentQuestion].options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`justify-start text-left ${
                      showFeedback
                        ? option === sampleQuestions[currentQuestion].correctAnswer
                          ? 'bg-green-500 hover:bg-green-600'
                          : option === selectedAnswer
                          ? 'bg-red-500 hover:bg-red-600'
                          : ''
                        : ''
                    }`}
                    disabled={showFeedback}
                  >
                    {option}
                    {showFeedback && option === sampleQuestions[currentQuestion].correctAnswer && (
                      <CheckCircle className="ml-2 w-5 h-5" />
                    )}
                    {showFeedback && option === selectedAnswer && option !== sampleQuestions[currentQuestion].correctAnswer && (
                      <AlertCircle className="ml-2 w-5 h-5" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
                <p className="text-xl">
                  You scored {score} out of {sampleQuestions.length}
                </p>
                <p className="text-lg mt-2">
                  ({((score / sampleQuestions.length) * 100).toFixed(1)}%)
                </p>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">Attempt History</h3>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearHistory}
                    className="text-sm"
                  >
                    Clear History
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {attempts
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((attempt) => (
                      <div key={attempt.id} className="p-3 bg-gray-100 rounded-lg">
                        <p>Date: {attempt.date}</p>
                        <p>Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)</p>
                      </div>
                    ))}
                </div>
              </div>
              
              <Button onClick={restartQuiz} className="w-full mt-4">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPlatform;