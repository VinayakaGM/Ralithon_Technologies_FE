"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Clock,
  ChevronRight,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  BookOpen,
  Target,
  ArrowRight,
  Home,
  LayoutDashboard,
  Edit,
  Badge,
} from "lucide-react";
import assessmentsService from "@/services/assessments.service";

interface Question {
  id: string;
  question: string;
  options: {
    [key: string]: string;
  };
  difficulty: string | null;
  explanation: string;
  answer: string;
  userAnswer: string | null;
  type: 'multiple_choice' | 'programming';
  section: 'APTITUDE' | 'ENGLISH' | 'CODING';
}

interface AssessmentData {
  assessment: Question[];
  attemptId?: string;
  assessmentId?: number;
  courseId?: number;
  courseName?: string;
}

interface TestResult {
  userId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  assessmentId: number;
  courseName: string;
  completedAt: string;
  answers: Answer[];
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  options: { [key: string]: string };
  isTextAnswer?: boolean;
  userTextAnswer?: string;
}

// Total time: 30 minutes = 1800 seconds
const TOTAL_TEST_DURATION = 30 * 60; // 1800 seconds

// First 20 questions: 1 min each, Last 2 questions: 5 min each
const getQuestionTimeLimit = (questionIndex: number): number => {
  if (questionIndex < 20) {
    return 60; // 1 minute for first 20 questions
  } else {
    return 300; // 5 minutes for last 2 questions
  }
};

// Check if question requires text answer (last 2 questions)
const isTextAnswerQuestion = (questionIndex: number) => {
  return questionIndex >= 20; // Last 2 questions (0-based index)
};

// Gradient style for buttons
const gradientStyle = {
  background: 'linear-gradient(270deg, rgb(6, 132, 190) 0%, rgb(2, 116, 186) 100%)'
};

// Assessment Header Component
const AssessmentHeader: React.FC<{
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
}> = ({ timeLeft, currentQuestion, totalQuestions }) => {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const isTimeRunningLow = timeLeft <= 60;
  const timerColor = isTimeRunningLow ? "text-red-400" : "text-green-400";

  return (
    <div className="bg-gray-900 text-white">
      {/* Main Header */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.jpeg"
                alt="Ralithon Logo"
                width={38}
                height={38}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl font-bold">Ralithon Technologies Assessment</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className={`border-t ${isTimeRunningLow ? "border-red-600 bg-red-900/20" : "border-gray-700"}`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 ${isTimeRunningLow ? "text-red-400 animate-pulse" : "text-green-400"}`} />
              <span className={`font-mono font-bold ${timerColor} text-lg ${isTimeRunningLow ? "animate-pulse" : ""}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-gray-300 text-sm ml-2">
                Total Time Left
              </span>
              {isTimeRunningLow && (
                <span className="text-red-400 text-xs font-semibold ml-2">⚠️ Auto-submitting soon!</span>
              )}
            </div>
            <div className="text-gray-300 text-sm">
              Question {currentQuestion} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Results Header Component
const ResultsHeader: React.FC<{
  onTakeAnotherTest: () => void;
  onGoHome: () => void;
  onGoDashboard: () => void;
}> = ({ onGoHome, onGoDashboard }) => {
  return (
    <div className="bg-gray-900 text-white">
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.jpeg"
                alt="Ralithon Logo"
                width={38}
                height={38}
                className="object-contain"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Assessment Results</h1>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={onGoHome}
                variant="outline"
                size="sm"
                className="p-2 sm:px-4 bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Go to Home</span>
              </Button>

              <Button
                onClick={onGoDashboard}
                style={gradientStyle}
                size="sm"
                className="p-2 sm:px-4"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Results Component
const ResultsPage: React.FC<{
  result: TestResult;
  onTakeAnotherTest: () => void;
  onGoHome: () => void;
  onGoDashboard: () => void;
}> = ({ result, onTakeAnotherTest, onGoHome, onGoDashboard }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "review">("overview");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const score = result.score;
  const isPassed = score >= 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Results Header */}
      <ResultsHeader
        onTakeAnotherTest={onTakeAnotherTest}
        onGoHome={onGoHome}
        onGoDashboard={onGoDashboard}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Score Card */}
        <div
          className={`${getScoreBgColor(score)} rounded-xl shadow p-6 mb-8 border-l-4 ${isPassed ? "border-l-green-500" : "border-l-red-500"
            }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{score}% Score</h2>
              <p className="text-gray-700 mt-1">
                {result.correctAnswers} out of {result.totalQuestions} correct
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Completed in {formatTime(result.timeSpent)}
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              {isPassed ? (
                <p className="text-green-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-5 w-5" /> Passed
                </p>
              ) : (
                <p className="text-red-700 font-semibold flex items-center gap-1">
                  <XCircle className="h-5 w-5" /> Failed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow border overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 text-center font-semibold ${activeTab === "overview"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-1" /> Overview
            </button>

            <button
              onClick={() => setActiveTab("review")}
              className={`flex-1 px-4 py-3 text-center font-semibold ${activeTab === "review"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              <BookOpen className="inline h-4 w-4 mr-1" /> Review Answers
            </button>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-4 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Correct Answers: <strong>{result.correctAnswers}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Incorrect Answers: <strong>{result.totalQuestions - result.correctAnswers}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Time Taken: <strong>{formatTime(result.timeSpent)}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>Completed On: <strong>{new Date(result.completedAt).toLocaleString()}</strong></span>
                </p>
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-3">
                {result.answers.map((answer, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                      className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="text-green-600 h-5 w-5" />
                        ) : (
                          <XCircle className="text-red-600 h-5 w-5" />
                        )}
                        <div className="text-left">
                          <strong className="text-gray-800">Question {index + 1}:</strong>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{answer.question}</p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`h-4 w-4 text-gray-400 transition-transform ${expandedQuestion === index ? "rotate-90" : ""
                          }`}
                      />
                    </button>

                    {expandedQuestion === index && (
                      <div className="p-4 bg-gray-50 space-y-3 border-t">
                        {/* For text answer questions (last 2) */}
                        {index >= 20 ? (
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Edit className="h-4 w-4" /> Your Written Answer:
                              </h4>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {answer.selectedAnswer || "No answer provided"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />Answer:
                              </h4>
                              <div className="bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-gray-800 whitespace-pre-wrap">{answer.correctAnswer}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* For multiple choice questions */
                          <div className="space-y-2">
                            {Object.entries(answer.options).map(([key, value]) => {
                              const isCorrect = key === answer.correctAnswer;
                              const isSelected = answer.selectedAnswer === key;
                              const isWrong = isSelected && !isCorrect;

                              return (
                                <div
                                  key={key}
                                  className={`p-3 border rounded flex items-start gap-2 ${isCorrect
                                    ? "bg-green-50 border-green-300"
                                    : isWrong
                                      ? "bg-red-50 border-red-300"
                                      : "bg-white border-gray-200"
                                    }`}
                                >
                                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-medium mt-0.5 ${isCorrect
                                    ? "bg-green-600 text-white"
                                    : isWrong
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-200 text-gray-700"
                                    }`}>
                                    {key}
                                  </div>
                                  <span className="flex-1">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TakeTestPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const isSubmittingRef = React.useRef(false);

  // Initialize question time limit based on index
  useEffect(() => {
    const timeLimit = getQuestionTimeLimit(currentQuestionIndex);
    setQuestionTimeRemaining(timeLimit);
  }, [currentQuestionIndex]);

  // Load assessment data
  useEffect(() => {
    const initializeAssessment = async () => {
      const user = AuthService.getCurrentUser();
      if (!user) {
        toast.error("Please login to take the test");
        router.push("/assessments/pretest");
        return;
      }
      setCurrentUser(user);

      try {
        const storedData = sessionStorage.getItem('assessmentData');
        if (!storedData) {
          toast.error("No assessment data found");
          router.push("/assessments/pretest");
          return;
        }

        const data: AssessmentData = JSON.parse(storedData);

        if (!data.assessment?.length) {
          toast.error("No questions available");
          router.push("/assessments/pretest");
          return;
        }

        // Ensure all questions are multiple_choice
        const processedQuestions = data.assessment.map((question, index) => ({
          ...question,
          type: 'multiple_choice' as 'multiple_choice' | 'programming',
          section: question.section || (['APTITUDE', 'ENGLISH', 'CODING'][index % 3] as any),
        }));

        setAssessmentData({ ...data, assessment: processedQuestions });
        setQuestions(processedQuestions);

        // Initialize answers
        const initialAnswers: Record<number, string> = {};
        const initialTextAnswers: Record<number, string> = {};
        processedQuestions.forEach((question, index) => {
          if (question.userAnswer) {
            initialAnswers[index] = question.userAnswer;
            // For last 2 questions, also set text answers
            if (index >= 20) {
              initialTextAnswers[index] = question.userAnswer;
            }
          }
        });
        setAnswers(initialAnswers);
        setTextAnswers(initialTextAnswers);

        // Initialize question time remaining for first question
        setQuestionTimeRemaining(getQuestionTimeLimit(0));

        setLoading(false);
      } catch (error) {
        console.error('Error loading assessment:', error);
        toast.error("Failed to load assessment");
        sessionStorage.removeItem('assessmentData');
        router.push("/assessments/pretest");
      }
    };

    initializeAssessment();
  }, [router]);

  // Total timer
  useEffect(() => {
    if (timeLeft <= 0 || showResults || !questions.length) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults, questions.length]);

  // Question timer
  useEffect(() => {
    if (showResults || !questions.length) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResults, questions.length]);


  useEffect(() => {
    if (timeLeft === 60 && !showResults) {
      toast.warning("⏰ Only 1 minute remaining! Assessment will auto-submit when time runs out.", {
        duration: 4000,
      });
    }
  }, [timeLeft, showResults]);

  useEffect(() => {
    if (timeLeft <= 0 && !showResults && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      handleSubmitAssessment(true, true); // force submit, auto submit
    }
  }, [timeLeft]);



  const handleTimeUp = async () => {
    const timeSpent = getQuestionTimeLimit(currentQuestionIndex) - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));

    // Auto-save answer before moving
    const currentAnswer = isTextAnswerQuestion(currentQuestionIndex)
      ? textAnswers[currentQuestionIndex] || ""
      : answers[currentQuestionIndex] || "";

    if (currentAnswer) {
      await saveAnswerToServer(currentQuestionIndex, currentAnswer);
    }

    await moveToNextQuestion();
  };

  const saveAnswerToServer = async (questionIndex: number, answer: string) => {
    if (!assessmentData?.assessmentId || !currentUser) return false;

    try {
      setIsSaving(true);
      const question = questions[questionIndex];
      const result = await assessmentsService.saveAnswer({
        userId: currentUser.userId,
        assessmentId: assessmentData.assessmentId,
        questionId: question.id,
        answer: answer,
        questionType: question.type
      });

      if (!result.success) {
        toast.error(result.message || "Failed to save answer");
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error("Failed to save answer");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerSelect = (optionKey: string) => {
    if (isTextAnswerQuestion(currentQuestionIndex)) {
      return;
    }
    const updatedAnswers = { ...answers, [currentQuestionIndex]: optionKey };
    setAnswers(updatedAnswers);
    saveAnswerToServer(currentQuestionIndex, optionKey);
  };
  const textSaveTimeoutRef = React.useRef<any>(null);

  const handleTextAnswerChange = (text: string) => {
    setTextAnswers(prev => ({ ...prev, [currentQuestionIndex]: text }));

    if (textSaveTimeoutRef.current) {
      clearTimeout(textSaveTimeoutRef.current);
    }

    textSaveTimeoutRef.current = setTimeout(() => {
      saveAnswerToServer(currentQuestionIndex, text);
    }, 1000);
  };


  const moveToNextQuestion = async () => {
    const timeSpent = getQuestionTimeLimit(currentQuestionIndex) - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));

    // Deduct unused time from the total time
    // If you finish early, you lose the remaining time for that question
    const unusedTime = questionTimeRemaining;
    if (unusedTime > 0) {
      setTimeLeft(prev => {
        const newTimeLeft = Math.max(0, prev - unusedTime);
        return newTimeLeft;
      });
    }

    const currentAnswer = isTextAnswerQuestion(currentQuestionIndex)
      ? textAnswers[currentQuestionIndex] || ""
      : answers[currentQuestionIndex] || "";

    if (currentAnswer) {
      await saveAnswerToServer(currentQuestionIndex, currentAnswer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setQuestionTimeRemaining(getQuestionTimeLimit(nextIndex));
    } else {
      handleSubmitAssessment(true);
    }
  };

  const handleNextQuestion = async () => {
    await moveToNextQuestion();
  };

  const handleSubmitAssessment = async (
    forceSubmit: boolean,
    isAutoSubmit = false
  ) => {
    if (
      !forceSubmit &&
      !isAutoSubmit &&
      getAnsweredQuestionsCount() < questions.length
    ) {
      toast.warning("You have unanswered questions. Submit anyway?", {
        action: {
          label: "Submit",
          onClick: () => handleSubmitAssessment(true),
        },
        duration: 5000,
      });
      return;
    }

    await handleSubmitTest();
  };

  const handleSubmitTest = useCallback(async () => {
    if (!assessmentData?.assessmentId || !currentUser) {
      toast.error("Assessment data not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await assessmentsService.submitAssessment({
        assessmentId: assessmentData.assessmentId,
        userId: currentUser.userId
      });

      if (result.success && result.data) {
        const calculatedScore = Math.round((result.data.correct / result.data.totalQuestions) * 100);
        setScore(calculatedScore);

        // Prepare test result data
        const testResultData: TestResult = {
          userId: currentUser.userId,
          score: calculatedScore,
          correctAnswers: result.data.correct,
          totalQuestions: result.data.totalQuestions,
          timeSpent: TOTAL_TEST_DURATION - timeLeft,
          assessmentId: assessmentData.assessmentId,
          courseName: assessmentData.courseName || "Assessment",
          completedAt: new Date().toISOString(),
          answers: questions.map((question, index) => ({
            questionId: question.id,
            selectedAnswer: isTextAnswerQuestion(index)
              ? textAnswers[index] || ""
              : answers[index] || "",
            correctAnswer: question.answer,
            isCorrect: isTextAnswerQuestion(index)
              ? textAnswers[index] === question.answer
              : answers[index] === question.answer,
            question: question.question,
            options: question.options,
            isTextAnswer: isTextAnswerQuestion(index),
            userTextAnswer: isTextAnswerQuestion(index) ? textAnswers[index] : undefined
          }))
        };

        setTestResult(testResultData);

        // Store in localStorage for persistence
        const existing = JSON.parse(localStorage.getItem("testResults") || "[]");
        existing.push(testResultData);
        localStorage.setItem("testResults", JSON.stringify(existing));

        // Clear assessment data from session storage
        sessionStorage.removeItem('assessmentData');

        // Show results
        setShowResults(true);
        toast.success(`Assessment submitted! Score: ${calculatedScore}%`);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  }, [assessmentData, currentUser, timeLeft, questions, answers, textAnswers]);

  const getAnsweredQuestionsCount = () => {
    let count = 0;
    for (let i = 0; i < questions.length; i++) {
      if (isTextAnswerQuestion(i)) {
        if (textAnswers[i] && textAnswers[i].trim().length > 0) {
          count++;
        }
      } else {
        if (answers[i] && answers[i].trim().length > 0) {
          count++;
        }
      }
    }
    return count;
  };

  const isQuestionAnswered = (index: number) => {
    if (isTextAnswerQuestion(index)) {
      return textAnswers[index] !== undefined && textAnswers[index].trim().length > 0;
    } else {
      return answers[index] !== undefined && answers[index].trim().length > 0;
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoDashboard = () => {
    router.push("/student-dashboard/assessments");
  };

  const handleTakeAnotherTest = () => {
    router.push("/assessments/pretest");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 text-center text-sm">No questions found for this assessment.</p>
            <Button
              onClick={() => router.push("/assessments/pretest")}
              className="w-full"
              style={gradientStyle}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionTimeLimit = getQuestionTimeLimit(currentQuestionIndex);
  const isTextQuestion = isTextAnswerQuestion(currentQuestionIndex);

  if (showResults && testResult) {
    return (
      <ResultsPage
        result={testResult}
        onTakeAnotherTest={handleTakeAnotherTest}
        onGoHome={handleGoHome}
        onGoDashboard={handleGoDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Assessment Header */}
      <AssessmentHeader
        timeLeft={timeLeft}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base font-semibold">Assessment Info</CardTitle>
                  </div>
                  <Button
                    onClick={() => handleSubmitAssessment(false)}
                    size="sm"
                    disabled={isSubmitting}
                    style={gradientStyle}
                  >
                    {isSubmitting ? <RotateCw className="h-4 w-4 animate-spin" /> : "Submit"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Important Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-amber-800">Important Notes:</p>
                      <ul className="text-xs text-amber-700 space-y-0.5 list-disc pl-3">
                        <li>Once you move to the next question, you cannot go back</li>
                        <li>Answer will be auto-saved when you select/write an answer</li>
                        <li>First 20 questions: 1 min each, Last 2 questions: 5 min each</li>
                        <li>Review all questions before submitting</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Time Information
                <div className="bg-white border rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Total Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Current Question:</span>
                      <span className="font-medium">{currentQuestionIndex + 1}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Question Type:</span>
                      <span className={`font-medium ${currentQuestionIndex < 20 ? "text-blue-600" : "text-green-600"}`}>
                        {currentQuestionIndex < 20 ? "Multiple Choice" : "Text Answer"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Time Limit:</span>
                      <span className={`font-medium ${currentQuestionIndex < 20 ? "text-blue-600" : "text-green-600"}`}>
                        {currentQuestionIndex < 20 ? "1 min" : "5 min"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Answered:</span>
                      <span className="font-medium">{getAnsweredQuestionsCount()}/{questions.length}</span>
                    </div>
                  </div>
                </div> */}

                {/* Question Progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Question Progress</h3>
                  <div className="grid grid-cols-5 gap-1.5">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded text-xs font-medium flex items-center justify-center ${index === currentQuestionIndex
                          ? "bg-blue-600 text-white"
                          : isQuestionAnswered(index)
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-white text-gray-600 border border-gray-300"
                          }`}
                        title={`Question ${index + 1}${index >= 20 ? ' (Text Answer)' : ''}`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Note: Questions 21-22 require text answers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Question {currentQuestionIndex + 1}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${questionTimeRemaining <= 10
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                      }`}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      {questionTimeRemaining}s / {currentQuestionTimeLimit}s
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex-1 overflow-auto">
                <div className="space-y-4 h-full flex flex-col">
                  {/* Question */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">
                        Q
                      </span>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>
                  </div>

                  {/* Content based on question type */}
                  {isTextQuestion ? (
                    <div className="space-y-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-700">Write your answer:</h3>
                      <div className="flex-1">
                        <Textarea
                          value={textAnswers[currentQuestionIndex] || ''}
                          onChange={(e) => handleTextAnswerChange(e.target.value)}
                          placeholder="Type your detailed answer here..."
                          className="min-h-[250px] text-sm"
                          disabled={isSaving}
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Your answer is auto-saved as you type</p>
                          {/* <p className="mt-1">Character count: {textAnswers[currentQuestionIndex]?.length || 0}</p> */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Select the correct option:</h3>
                      <div className="space-y-2">
                        {Object.entries(currentQuestion.options).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => handleAnswerSelect(key)}
                            className={`w-full p-3 text-left rounded border transition-colors text-sm ${answers[currentQuestionIndex] === key
                              ? "border-blue-500 bg-blue-50 text-blue-800"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-start space-x-2">
                              <span className={`rounded w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5 ${answers[currentQuestionIndex] === key
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}>
                                {key}
                              </span>
                              <span className="flex-1">{value}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-500 text-center flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>Note: Cannot go back to previous questions</span>
                    </div>
                    <Button
                      onClick={handleNextQuestion}
                      size="sm"
                      style={gradientStyle}
                    >
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Submit Assessment"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}