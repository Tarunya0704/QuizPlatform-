"use client"


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Timer, Trophy } from 'lucide-react';

// Sample questions - replace with your actual questions
const sampleQuestions = [
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

const QuizPlatform = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [attempts, setAttempts] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showScore) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showScore) {
      handleNextQuestion();
    }
  }, [timeLeft, showScore]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (answer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      const newAttempt = {
        date: new Date().toLocaleString(),
        score: score,
        totalQuestions: sampleQuestions.length
      };
      setAttempts([...attempts, newAttempt]);
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

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
                {sampleQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
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
                <h3 className="text-xl font-semibold mb-3">Attempt History</h3>
                <div className="space-y-2">
                  {attempts.map((attempt, index) => (
                    <div key={index} className="p-3 bg-gray-100 rounded-lg">
                      <p>Date: {attempt.date}</p>
                      <p>Score: {attempt.score}/{attempt.totalQuestions}</p>
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