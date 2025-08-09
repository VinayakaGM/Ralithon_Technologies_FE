"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Flag,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AssessmentQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: string | null;
  explanation: string;
  answer: string;
}

interface AssessmentResponse {
  success: boolean;
  message?: string;
  data?: {
    assessment: AssessmentQuestion[];
    attemptId?: string;
  };
}

interface AssessmentState {
  data: AssessmentResponse;
  courseName: string;
}

interface AssessmentProgress {
  answers: Record<number, string>;
  currentQuestion: number;
  questionTimeRemaining: number;
  flaggedQuestions: number[];
  lastSavedTimestamp: number;
}

export default function Assessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [assessmentData, setAssessmentData] =
    useState<AssessmentResponse | null>(null);
  const [courseName, setCourseName] = useState("Course");
  const [isAutoMoving, setIsAutoMoving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Load assessment state with error handling
  useEffect(() => {
    const loadAssessmentState = async () => {
      try {
        const savedState = localStorage.getItem("assessmentState");
        if (savedState) {
          const parsedState: AssessmentState = JSON.parse(savedState);
          setAssessmentData(parsedState.data);
          setCourseName(parsedState.courseName);

          const progressState = localStorage.getItem("assessmentProgress");
          if (progressState) {
            const progress: AssessmentProgress = JSON.parse(progressState);

            // Check if the session is expired (more than 24 hours old)
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            if (Date.now() - progress.lastSavedTimestamp > TWENTY_FOUR_HOURS) {
              localStorage.removeItem("assessmentProgress");
              toast.error(
                "Your previous session has expired. Starting a new assessment."
              );
              resetState();
            } else {
              setAnswers(progress.answers || {});
              setCurrentQuestion(progress.currentQuestion || 0);
              setQuestionTimeRemaining(progress.questionTimeRemaining || 30);
              setFlaggedQuestions(
                progress.flaggedQuestions
                  ? new Set(progress.flaggedQuestions)
                  : new Set()
              );
              setLastSavedTime(progress.lastSavedTimestamp);
            }
          }
        } else {
          toast.error("No assessment data found");
          router.back();
        }
      } catch (error) {
        console.error("Failed to load assessment state", error);
        toast.error("Failed to load assessment data. Starting fresh.");
        resetState();
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessmentState();

    // Network status detection
    const handleOnline = () => setNetworkError(false);
    const handleOffline = () => setNetworkError(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial network status
    if (!navigator.onLine) {
      setNetworkError(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Timer logic with auto-submit
  useEffect(() => {
    if (isSubmitted || !assessmentData || isLoading) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentQuestion < assessmentData.data!.assessment.length - 1) {
            setIsAutoMoving(true);
            setTimeout(() => {
              handleNextQuestion();
              setIsAutoMoving(false);
            }, 1000);
          } else {
            handleSubmitAssessment();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isSubmitted, assessmentData, isLoading]);

  const resetState = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setQuestionTimeRemaining(30);
    setFlaggedQuestions(new Set());
    setLastSavedTime(null);
  };

  // Auto-save progress with error handling
  useEffect(() => {
    if (!isSubmitted && assessmentData && !isLoading) {
      const saveProgress = () => {
        try {
          const progress: AssessmentProgress = {
            answers,
            currentQuestion,
            questionTimeRemaining,
            flaggedQuestions: Array.from(flaggedQuestions),
            lastSavedTimestamp: Date.now(),
          };

          localStorage.setItem("assessmentProgress", JSON.stringify(progress));
          setLastSavedTime(Date.now());
        } catch (error) {
          console.error("Failed to save progress", error);
          // Retry after a delay if storage is full
          setTimeout(saveProgress, 1000);
        }
      };

      // Save immediately on changes
      saveProgress();

      // Also set up periodic saving
      const saveInterval = setInterval(saveProgress, 5000);

      // Save before unload
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        saveProgress();
        // For modern browsers
        e.preventDefault();
        // For older browsers
        e.returnValue = "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        clearInterval(saveInterval);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [
    isSubmitted,
    answers,
    currentQuestion,
    questionTimeRemaining,
    flaggedQuestions,
    assessmentData,
    isLoading,
  ]);

  const handleAnswerSelect = useCallback(
    (questionIndex: number, selectedOption: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionIndex]: selectedOption,
      }));
    },
    []
  );

  const toggleFlagQuestion = useCallback((index: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (
      assessmentData?.data?.assessment &&
      currentQuestion < assessmentData.data.assessment.length - 1
    ) {
      setCurrentQuestion((prev) => prev + 1);
      setQuestionTimeRemaining(30);
    } else {
      handleSubmitAssessment();
    }
  }, [assessmentData, currentQuestion]);

  const calculateScore = useCallback(() => {
    if (!assessmentData?.data?.assessment) return 0;

    let correctAnswers = 0;
    assessmentData.data.assessment.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
      }
    });

    return Math.round(
      (correctAnswers / assessmentData.data.assessment.length) * 100
    );
  }, [assessmentData, answers]);

  const getAnsweredQuestionsCount = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const getProgressPercentage = useCallback(() => {
    if (!assessmentData?.data?.assessment) return 0;
    return (
      (getAnsweredQuestionsCount() / assessmentData.data.assessment.length) *
      100
    );
  }, [assessmentData, getAnsweredQuestionsCount]);

  const handleSubmitAssessment = useCallback(async () => {
    if (!assessmentData?.data?.assessment) return;

    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsSubmitted(true);
    setShowResults(true);

    try {
      // Try to submit to server
      const submitToServer = async () => {
        try {
          const response = await fetch("/api/submit-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              //   attemptId: assessmentData.data.attemptId,
              answers,
              score: calculatedScore,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to submit assessment");
          }

          // Clear local storage only after successful submission
          localStorage.removeItem("assessmentProgress");
          return true;
        } catch (error) {
          console.error("Failed to submit assessment", error);
          return false;
        }
      };

      // Try to submit immediately
      let submitted = await submitToServer();

      // If offline or failed, save to localStorage and try later
      if (!submitted) {
        const pendingSubmissions = JSON.parse(
          localStorage.getItem("pendingSubmissions") || "[]"
        );
        pendingSubmissions.push({
          attemptId: assessmentData.data.attemptId,
          answers,
          score: calculatedScore,
          timestamp: Date.now(),
        });
        localStorage.setItem(
          "pendingSubmissions",
          JSON.stringify(pendingSubmissions)
        );

        toast.warning(
          "Your answers have been saved locally and will be submitted when you're back online",
          {
            duration: 10000,
          }
        );
      } else {
        toast.success("Assessment Submitted!", {
          description: `You scored ${calculatedScore}% on the ${courseName} assessment.`,
        });
      }
    } catch (error) {
      console.error("Failed to submit assessment", error);
      toast.error(
        "Failed to submit assessment results. Your answers have been saved locally."
      );
    }
  }, [assessmentData, answers, calculateScore, courseName]);

  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  // Process pending submissions when back online
  useEffect(() => {
    if (!networkError) {
      const processPendingSubmissions = async () => {
        const pendingSubmissions = JSON.parse(
          localStorage.getItem("pendingSubmissions") || "[]"
        );
        if (pendingSubmissions.length > 0) {
          try {
            for (const submission of pendingSubmissions) {
              const response = await fetch("/api/submit-assessment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(submission),
              });

              if (response.ok) {
                // Remove successfully submitted item
                const updatedSubmissions = pendingSubmissions.filter(
                  (s: any) => s.timestamp !== submission.timestamp
                );
                localStorage.setItem(
                  "pendingSubmissions",
                  JSON.stringify(updatedSubmissions)
                );
              }
            }
          } catch (error) {
            console.error("Failed to process pending submissions", error);
          }
        }
      };

      processPendingSubmissions();
    }
  }, [networkError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assessmentData?.data?.assessment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Assessment Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to load assessment data. Please try again.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestionData = assessmentData.data.assessment[currentQuestion];
  const totalQuestions = assessmentData.data.assessment.length;

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl h-[calc(100vh-32px)]">
      {/* Network Error Banner */}
      {networkError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>
              <strong>Network Error:</strong> You're currently offline. Your
              answers will be saved locally and submitted when you're back
              online.
            </p>
          </div>
        </div>
      )}

      {/* Last Saved Indicator */}
      {lastSavedTime && (
        <div className="text-xs text-gray-500 mb-2 flex items-center">
          <RotateCw className="h-3 w-3 mr-1" />
          Last saved: {new Date(lastSavedTime).toLocaleTimeString()}
        </div>
      )}

      {!showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Left Column - Question Navigator */}
          <div className="lg:col-span-1 h-full flex flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {courseName} Assessment
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                <div className="space-y-4">
                  {/* Assessment Info */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-800 text-sm">
                        {assessmentData.message}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-600">
                      <span>
                        Question {currentQuestion + 1} of {totalQuestions}
                      </span>
                      <span>{getAnsweredQuestionsCount()} answered</span>
                    </div>
                    <Progress
                      value={getProgressPercentage()}
                      className="mt-2 h-2"
                    />
                  </div>

                  {/* Question Navigator */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Question Status
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {assessmentData.data.assessment.map((_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded text-sm font-medium transition-all flex items-center justify-center ${
                            index === currentQuestion
                              ? "bg-blue-600 text-white"
                              : flaggedQuestions.has(index)
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : answers[index]
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-amber-50 text-gray-600 border border-amber-200"
                          }`}
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span>Current</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span>Answered</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                        <span>Flagged</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
                        <span>Not Answered</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button (Mobile) */}
                  <div className="lg:hidden">
                    <Button
                      onClick={handleSubmitAssessment}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={getAnsweredQuestionsCount() === 0}
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Question and Options */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-lg">
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-medium text-sm">
                      {questionTimeRemaining}s remaining
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFlagQuestion(currentQuestion)}
                  className={`${
                    flaggedQuestions.has(currentQuestion)
                      ? "text-yellow-600"
                      : "text-gray-400"
                  }`}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.has(currentQuestion) ? "Flagged" : "Flag"}
                </Button>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                <div className="space-y-4 h-full flex flex-col">
                  {/* Question */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-medium whitespace-pre-line">
                      {currentQuestionData.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 flex-grow">
                    {Object.entries(currentQuestionData.options).map(
                      ([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            handleAnswerSelect(currentQuestion, key)
                          }
                          className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                            answers[currentQuestion] === key
                              ? "border-blue-500 bg-blue-50 text-blue-800"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          aria-pressed={answers[currentQuestion] === key}
                        >
                          <span className="font-medium">{key}.</span>{" "}
                          {value.replace(/^[A-D]\.\s*/, "")}
                        </button>
                      )
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end items-center pt-2 pb-2">
                    {currentQuestion === totalQuestions - 1 ? (
                      <Button
                        onClick={handleSubmitAssessment}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={
                          getAnsweredQuestionsCount() === 0 || isAutoMoving
                        }
                      >
                        Submit Assessment
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={isAutoMoving}
                      >
                        {isAutoMoving ? "Moving..." : "Next"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="h-full overflow-auto">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  score >= 70
                    ? "bg-green-100"
                    : score >= 50
                    ? "bg-yellow-100"
                    : "bg-red-100"
                }`}
              >
                {score >= 70 ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : score >= 50 ? (
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Assessment Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                You scored <span className="font-bold text-2xl">{score}%</span>{" "}
                on the {courseName} assessment
              </p>
              <div className="bg-gray-50 p-4 rounded-lg inline-block">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Questions: {totalQuestions}</div>
                  <div>Answered: {getAnsweredQuestionsCount()}</div>
                  <div>
                    Correct: {Math.round((score / 100) * totalQuestions)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Question Breakdown</h4>
              {assessmentData.data.assessment.map((q, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{q.question}</p>
                    {answers[index] === q.answer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {answers[index] && (
                    <div className="mt-2">
                      <p className="text-sm">
                        Your answer:{" "}
                        <span
                          className={`font-medium ${
                            answers[index] === q.answer
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {answers[index]}
                        </span>
                      </p>
                      {answers[index] !== q.answer && (
                        <p className="text-sm">
                          Correct answer:{" "}
                          <span className="font-medium text-green-600">
                            {q.answer}
                          </span>
                        </p>
                      )}
                      {q.explanation && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Explanation:</span>{" "}
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Review Answers
              </Button>
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue to Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
