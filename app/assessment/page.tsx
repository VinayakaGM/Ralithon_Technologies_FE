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
import UserService from "@/services/users.service";
import authService from "@/services/auth.service";
import axios from "axios";

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
    assessmentId?: number;
  };
}

interface AssessmentState {
  data: AssessmentResponse;
  courseName: string;
  courseId?: number;
  userId?: number;
  assessmentId?: number;
}

interface AssessmentProgress {
  answers: Record<number, string>;
  currentQuestion: number;
  questionTimeRemaining: number;
  flaggedQuestions: number[];
  lastSavedTimestamp: number;
  assessmentId: number;
}

interface AssessmentSubmissionPayload {
  userId: number | undefined;
  assessmentId: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  score: number;
  totalMarks: number;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/";

export default function Assessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [assessmentData, setAssessmentData] =
    useState<AssessmentResponse | null>(null);
  const [courseName, setCourseName] = useState("Course");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAutoMoving, setIsAutoMoving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [allTimersCompleted, setAllTimersCompleted] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<number | null>(
    null
  );
  const [tabChanged, setTabChanged] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [forceSubmitEnabled, setForceSubmitEnabled] = useState(false);
  const currentUser = authService.getCurrentUser();

  // Track user activity and violations
  useEffect(() => {
    if (isSubmitted) return;

    let timeoutId: NodeJS.Timeout;

    const handleUserActivity = () => {
      setShowWarning(false);
      clearTimeout(timeoutId);
    };

    // Listen for user activity
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    // Check for inactivity or violations
    const checkActivity = () => {
      setViolationCount((prev) => {
        if (prev >= 2) {
          handleSubmitAssessment();
          toast.error("Assessment auto-submitted due to multiple violations");
          return prev;
        }
        return prev + 1;
      });
      setShowWarning(true);
    };

    timeoutId = setTimeout(checkActivity, 15000); // 15 seconds of inactivity

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [isSubmitted]);

  // Enhanced tab/window visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabChanged(true);
        setViolationCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            handleSubmitAssessment();
            toast.error("Assessment auto-submitted due to tab switching");
          }
          return newCount;
        });
        toast.warning(
          `You switched tabs/windows. ${
            2 - violationCount
          } more violation(s) will auto-submit.`,
          {
            duration: 10000,
          }
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSubmitted, violationCount]);

  // Enhanced beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitted) {
        setViolationCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            handleSubmitAssessment();
            return newCount;
          }
          return newCount;
        });

        if (violationCount >= 1) {
          handleSubmitAssessment();
        }

        e.preventDefault();
        e.returnValue = `You have unsaved changes. Continuing will auto-submit your assessment. 
          ${2 - violationCount} more violation(s) allowed.`;
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitted, violationCount]);

  // Auto-submit after violations
  useEffect(() => {
    if (violationCount >= 2 && !isSubmitted) {
      handleSubmitAssessment();
      toast.error("Assessment auto-submitted due to multiple violations");
    }
  }, [violationCount, isSubmitted]);

  // Load assessment state with error handling
  useEffect(() => {
    const loadAssessmentState = async () => {
      try {
        const savedState = localStorage.getItem("assessmentState");
        if (savedState) {
          const parsedState: AssessmentState = JSON.parse(savedState);

          const progressState = localStorage.getItem("assessmentProgress");
          if (progressState) {
            const progress: AssessmentProgress = JSON.parse(progressState);

            if (progress.assessmentId !== parsedState.data.data?.assessmentId) {
              localStorage.removeItem("assessmentProgress");
              resetState();
            } else {
              setAnswers(progress.answers || {});
              setCurrentQuestion(progress.currentQuestion || 0);
              setQuestionTimeRemaining(progress.questionTimeRemaining || 45);
              setFlaggedQuestions(
                progress.flaggedQuestions
                  ? new Set(progress.flaggedQuestions)
                  : new Set()
              );
              setLastSavedTime(progress.lastSavedTimestamp);
              setCurrentAssessmentId(progress.assessmentId);
            }
          }

          setAssessmentData(parsedState.data);
          setCourseName(parsedState.courseName);
          if (parsedState.courseId) setCourseId(parsedState.courseId);
          if (parsedState.userId) setUserId(parsedState.userId);
          if (parsedState.data.data?.assessmentId) {
            setCurrentAssessmentId(parsedState.data.data.assessmentId);
          }

          if (progressState) {
            const progress: AssessmentProgress = JSON.parse(progressState);
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            if (Date.now() - progress.lastSavedTimestamp > TWENTY_FOUR_HOURS) {
              localStorage.removeItem("assessmentProgress");
              toast.error(
                "Your previous session has expired. Starting a new assessment."
              );
              resetState();
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

    const handleOnline = () => {
      setNetworkError(false);
      processPendingSubmissions();
    };
    const handleOffline = () => setNetworkError(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setNetworkError(!navigator.onLine);

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
            setAllTimersCompleted(true);
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
    setQuestionTimeRemaining(45);
    setFlaggedQuestions(new Set());
    setLastSavedTime(null);
    setAllTimersCompleted(false);
    setTabChanged(false);
    setViolationCount(0);
    setShowWarning(false);
    setForceSubmitEnabled(false);
  };

  useEffect(() => {
    if (!isSubmitted && assessmentData && !isLoading && currentAssessmentId) {
      const saveProgress = () => {
        try {
          const progress: AssessmentProgress = {
            answers,
            currentQuestion,
            questionTimeRemaining,
            flaggedQuestions: Array.from(flaggedQuestions),
            lastSavedTimestamp: Date.now(),
            assessmentId: currentAssessmentId,
          };

          localStorage.setItem("assessmentProgress", JSON.stringify(progress));
          setLastSavedTime(Date.now());
        } catch (error) {
          console.error("Failed to save progress", error);
          setTimeout(saveProgress, 1000);
        }
      };

      saveProgress();
      const saveInterval = setInterval(saveProgress, 5000);

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        saveProgress();
        e.preventDefault();
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
    currentAssessmentId,
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
      setQuestionTimeRemaining(45);
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

  const submitAssessmentResults = async (
    calculatedScore: number
  ): Promise<boolean> => {
    if (
      !assessmentData?.data?.assessment ||
      !assessmentData.data.assessment ||
      !assessmentData.data.assessmentId ||
      !userId
    ) {
      throw new Error("Missing required assessment data");
    }

    const totalQuestions = assessmentData.data.assessment.length;
    const correctAnswers = Math.round((calculatedScore / 100) * totalQuestions);
    const attempted = getAnsweredQuestionsCount();

    const payload: AssessmentSubmissionPayload = {
      userId: currentUser?.userId,
      assessmentId: assessmentData.data.assessmentId,
      totalQuestions,
      attempted,
      correct: correctAnswers,
      score: calculatedScore,
      totalMarks: totalQuestions,
    };

    try {
      const response = await axios.post(
        `${API_URL}admin/assessments/submit`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getAuthToken()}`,
          },
        }
      );

      if (response.data && response.data.success) {
        return true;
      }
      throw new Error(response.data?.message || "Failed to submit assessment");
    } catch (error: any) {
      console.error("Assessment submission error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const processPendingSubmissions = async () => {
    const pendingSubmissions = JSON.parse(
      localStorage.getItem("pendingSubmissions") || "[]"
    );
    if (pendingSubmissions.length > 0) {
      try {
        const successfulSubmissions: number[] = [];

        for (const submission of pendingSubmissions) {
          try {
            const result = await submitAssessmentResults(submission.score);
            if (result) {
              successfulSubmissions.push(submission.timestamp);
            }
          } catch (error) {
            console.error("Failed to submit pending assessment", error);
          }
        }

        if (successfulSubmissions.length > 0) {
          const updatedSubmissions = pendingSubmissions.filter(
            (s: any) => !successfulSubmissions.includes(s.timestamp)
          );
          localStorage.setItem(
            "pendingSubmissions",
            JSON.stringify(updatedSubmissions)
          );

          if (updatedSubmissions.length < pendingSubmissions.length) {
            toast.success(
              `${
                pendingSubmissions.length - updatedSubmissions.length
              } pending assessment(s) submitted successfully`
            );
          }
        }
      } catch (error) {
        console.error("Failed to process pending submissions", error);
      }
    }
  };

  const handleSubmitAssessment = useCallback(
    async (forceSubmit: boolean = false) => {
      if (!assessmentData?.data?.assessment || isSubmitted) return;

      // If not forcing submit and not all timers completed, show confirmation
      if (
        !forceSubmit &&
        !allTimersCompleted &&
        !forceSubmitEnabled &&
        getAnsweredQuestionsCount() > 0
      ) {
        setForceSubmitEnabled(true);
        toast.warning(
          "You haven't completed all questions. Click submit again to confirm.",
          {
            duration: 5000,
            action: {
              label: "Cancel",
              onClick: () => setForceSubmitEnabled(false),
            },
          }
        );
        return;
      }

      const calculatedScore = calculateScore();
      setScore(calculatedScore);
      setIsSubmitted(true);
      setShowResults(true);

      try {
        let submitted = false;
        if (navigator.onLine) {
          try {
            submitted = await submitAssessmentResults(calculatedScore);
          } catch (error) {
            console.error("Server submission failed, saving locally", error);
          }
        }

        if (!submitted) {
          const pendingSubmissions = JSON.parse(
            localStorage.getItem("pendingSubmissions") || "[]"
          );
          pendingSubmissions.push({
            userId,
            assessmentId: assessmentData.data.assessmentId,
            totalQuestions: assessmentData.data.assessment.length,
            attempted: getAnsweredQuestionsCount(),
            correct: Math.round(
              (calculatedScore / 100) * assessmentData.data.assessment.length
            ),
            score: calculatedScore,
            totalMarks: assessmentData.data.assessment.length,
            timestamp: Date.now(),
          });
          localStorage.setItem(
            "pendingSubmissions",
            JSON.stringify(pendingSubmissions)
          );

          if (!navigator.onLine) {
            toast.warning(
              "Your answers have been saved locally and will be submitted when you're back online",
              { duration: 10000 }
            );
          } else {
            toast.warning(
              "There was an issue submitting your answers. They've been saved and we'll try again later.",
              { duration: 10000 }
            );
          }
        } else {
          localStorage.removeItem("assessmentProgress");
          localStorage.removeItem("assessmentState");
          toast.success("Assessment Submitted!", {
            description: `You scored ${calculatedScore}% on the ${courseName} assessment.`,
          });
        }
      } catch (error) {
        console.error("Failed to submit assessment", error);
        toast.error(
          "Failed to submit assessment results. Your answers have been saved locally."
        );
      } finally {
        setForceSubmitEnabled(false);
      }
    },
    [
      assessmentData,
      answers,
      calculateScore,
      courseName,
      userId,
      isSubmitted,
      allTimersCompleted,
      currentQuestion,
      questionTimeRemaining,
      getAnsweredQuestionsCount,
      forceSubmitEnabled,
    ]
  );

  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (!networkError) {
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

      {showWarning && !isSubmitted && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>
              <strong>Warning:</strong> You have {2 - violationCount}{" "}
              violation(s) remaining before auto-submit. Continue working on
              your assessment to reset.
            </p>
          </div>
        </div>
      )}

      {tabChanged && !isSubmitted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>
              <strong>Warning:</strong> You switched tabs/windows.{" "}
              {2 - violationCount} more violation(s) will auto-submit.
            </p>
          </div>
        </div>
      )}

      {lastSavedTime && (
        <div className="text-xs text-gray-500 mb-2 flex items-center">
          <RotateCw className="h-3 w-3 mr-1" />
          Last saved: {new Date(lastSavedTime).toLocaleTimeString()}
        </div>
      )}

      {!isSubmitted && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">IMPORTANT ASSESSMENT RULES:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Do not refresh or close this tab - will count as violation
                </li>
                <li>
                  Do not switch to other tabs/windows - will count as violation
                </li>
                <li>2 violations will auto-submit your assessment</li>
                <li>All actions are monitored and recorded</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
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

                  <div className="lg:hidden">
                    <Button
                      onClick={() => handleSubmitAssessment(forceSubmitEnabled)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={getAnsweredQuestionsCount() === 0}
                    >
                      {forceSubmitEnabled
                        ? "Confirm Submit"
                        : "Submit Assessment"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-medium whitespace-pre-line">
                      {currentQuestionData.question}
                    </p>
                  </div>

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

                  <div className="flex justify-end items-center pt-2 pb-2">
                    {currentQuestion === totalQuestions - 1 ? (
                      <Button
                        onClick={() =>
                          handleSubmitAssessment(forceSubmitEnabled)
                        }
                        className="bg-green-600 hover:bg-green-700"
                        disabled={
                          getAnsweredQuestionsCount() === 0 || isAutoMoving
                        }
                      >
                        {forceSubmitEnabled
                          ? "Confirm Submit"
                          : "Submit Assessment"}
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
