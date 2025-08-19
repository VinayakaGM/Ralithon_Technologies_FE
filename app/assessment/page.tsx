"use client";

import { useState, useEffect, useMemo } from "react";
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
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UserService from "@/services/users.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    [key: string]: string;
  };
  difficulty: string | null;
  explanation: string;
  answer: string;
  userAnswer: string | null;
}

interface AssessmentResponse {
  success: boolean;
  message?: string;
  data?: {
    assessment: AssessmentQuestion[];
    attemptId?: string;
    assessmentId?: number;
    orderId?: string | null;
    amount?: number | null;
    currency?: string | null;
    razorpayKey?: string | null;
  };
}

interface AssessmentState {
  data: AssessmentResponse;
  courseName: string;
  courseId?: number;
  userId?: number;
  assessmentId?: number;
}

interface AssessmentSubmissionResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  unanswered: number;
  marks: number;
}

export default function Assessment() {
  const router = useRouter();
  const [assessmentData, setAssessmentData] = useState<AssessmentResponse>({
    success: false,
    data: {
      assessment: [],
    },
  });
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState<number | undefined>();
  const [assessmentId, setAssessmentId] = useState<number | undefined>();
  const [userId, setUserId] = useState<number | undefined>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [forceSubmitEnabled, setForceSubmitEnabled] = useState(false);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const questionsToDisplay = useMemo(() => {
    if (!assessmentData.data?.assessment) return [];

    if (reviewMode) {
      return assessmentData.data.assessment.map((q, index) => ({
        ...q,
        originalIndex: index
      }));
    } else {
      return assessmentData.data.assessment.map((q, index) => ({
        ...q,
        originalIndex: index
      }));
    }
  }, [assessmentData, reviewMode]);

  const currentQuestionData = useMemo(() => {
    if (questionsToDisplay.length === 0) return null;
    return questionsToDisplay[currentQuestionIndex];
  }, [questionsToDisplay, currentQuestionIndex]);

  useEffect(() => {
    const loadAssessmentState = () => {
      const savedState = localStorage.getItem("assessmentState");
      if (savedState) {
        const state: AssessmentState = JSON.parse(savedState);
        setAssessmentData(state.data);
        setCourseName(state.courseName);
        setCourseId(state.courseId);
        setAssessmentId(state.data.data?.assessmentId);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = currentUser.userId;
        setUserId(currentUserId);
      } else {
        toast.error("No assessment found. Please start a new assessment.");
        router.push("/courses");
      }
    };

    loadAssessmentState();
  }, [router]);

  useEffect(() => {
    if (assessmentData.data?.assessment) {
      const initialAnswers: Record<number, string> = {};
      assessmentData.data.assessment.forEach((question, index) => {
        if (question.userAnswer) {
          initialAnswers[index] = question.userAnswer;
        }
      });
      setAnswers(initialAnswers);
    }
  }, [assessmentData]);

  useEffect(() => {
    if (showResults || reviewMode || questionsToDisplay.length === 0) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });

      setTotalTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResults, reviewMode, questionsToDisplay]);

  const totalQuestions = assessmentData.data?.assessment?.length || 0;

  const getAnsweredQuestionsCount = () => {
    if (!assessmentData.data?.assessment) return 0;

    return assessmentData.data.assessment.filter((q, index) => {
      return q.userAnswer !== null || answers[index] !== undefined;
    }).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredQuestionsCount() / totalQuestions) * 100;
  };

  const handleTimeUp = async () => {
    if (!currentQuestionData) return;

    const answer = answers[currentQuestionData.originalIndex] || "";
    const success = await submitAnswer(answer);

    if (success) {
      moveToNextQuestion();
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!assessmentId || !currentQuestionData?.id) return false;

    try {
      setIsSubmitting(true);
      const response = await UserService.submitAnswer(
        userId,
        assessmentId,
        currentQuestionData.id,
        answer
      );

      if (response.success) {
        setAnswers(prev => ({ ...prev, [currentQuestionData.originalIndex]: answer }));
        setAssessmentData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            assessment: prev.data?.assessment?.map((q, idx) =>
              idx === currentQuestionData.originalIndex
                ? { ...q, userAnswer: answer }
                : q
            ) || []
          }
        }));
        return true;
      } else {
        toast.error(response.message || "Failed to save answer");
        return false;
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to save answer. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentQuestionData) return;

    if (!reviewMode) {
      const answer = answers[currentQuestionData.originalIndex] || "";
      const success = await submitAnswer(answer);
      if (!success) return;
    }

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questionsToDisplay.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (!reviewMode) {
        setQuestionTimeRemaining(30);
      }
    } else if (!reviewMode) {
      handleSubmitAssessment(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async (forceSubmit: boolean) => {
    if (!forceSubmit && getAnsweredQuestionsCount() < totalQuestions) {
      setForceSubmitEnabled(true);
      toast.warning(
        "Are you sure you want to submit? You have unanswered questions.",
        {
          action: {
            label: "Submit Anyway",
            onClick: () => handleSubmitAssessment(true),
          },
          duration: 10000,
        }
      );
      return;
    }

    if (!userId || !assessmentId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await UserService.submitAssessment(assessmentId, userId);

      if (response.success && response.data) {
        const correctAnswers = response.data.correct;
        const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
        setScore(calculatedScore);
        setShowResults(true);
        toast.success(`Assessment submitted successfully! Your score: ${calculatedScore}%`);
      } else {
        toast.error(response.message || "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
      setForceSubmitEnabled(false);
    }
  };

  const toggleFlagQuestion = (questionIndex: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleClose = () => {
    localStorage.removeItem("assessmentState");
    router.push(`/student-dashboard/assessments`);
  };

  const enterReviewMode = () => {
    setReviewMode(true);
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  if (!assessmentData.data?.assessment || assessmentData.data.assessment.length === 0) {
    return <LoadingSpinner message="Loading Assessment..." />;
  }

  if (questionsToDisplay.length === 0 && !reviewMode) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Assessment Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have answered all questions.</p>
            <Button onClick={() => handleSubmitAssessment(false)} className="w-full">
              Submit Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestionData) {
    return <LoadingSpinner message="Preparing questions..." />;
  }

  const isQuestionAnswered = (index: number) => {
    return assessmentData.data?.assessment?.[index]?.userAnswer !== null ||
      answers[index] !== undefined;
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl h-[calc(100vh-32px)]">
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
                      {reviewMode && " (Review Mode)"}
                    </CardTitle>
                  </div>
                  {/* Add submit button for large screens */}
                  <div className="hidden lg:block">
                    {!reviewMode && (
                      <Button
                        onClick={() => handleSubmitAssessment(forceSubmitEnabled)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                        size="sm"
                      >
                        {isSubmitting ? (
                          <RotateCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {forceSubmitEnabled ? "Confirm Submit" : "Submit"}
                      </Button>
                    )}
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
                        Question {currentQuestionIndex + 1} of {questionsToDisplay.length}
                        {reviewMode ? "" : " (unanswered)"}
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
                      {assessmentData.data.assessment.map((q, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (reviewMode) {
                              // In review mode, find the index in questionsToDisplay
                              const reviewIndex = questionsToDisplay.findIndex(
                                qd => qd.originalIndex === index
                              );
                              if (reviewIndex >= 0) {
                                setCurrentQuestionIndex(reviewIndex);
                              }
                            }
                          }}
                          className={`aspect-square rounded text-sm font-medium transition-all flex items-center justify-center ${!reviewMode &&
                              currentQuestionData.originalIndex === index
                              ? "bg-blue-600 text-white"
                              : flaggedQuestions.has(index)
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                : isQuestionAnswered(index)
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-amber-50 text-gray-600 border border-amber-200"
                            }`}
                        >
                          {index + 1}
                        </button>
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
                    {!reviewMode && (
                      <Button
                        onClick={() => handleSubmitAssessment(forceSubmitEnabled)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <RotateCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {forceSubmitEnabled
                          ? "Confirm Submit"
                          : "Submit Assessment"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                    {reviewMode ? "" : ""}
                  </CardTitle>
                  {!reviewMode && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded ${questionTimeRemaining <= 10
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-50 text-orange-600"
                      }`}>
                      <Clock className="h-4 w-4" />
                      <span className="font-mono font-medium text-sm">
                        {questionTimeRemaining}s remaining
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFlagQuestion(currentQuestionData.originalIndex)}
                  className={`${flaggedQuestions.has(currentQuestionData.originalIndex)
                      ? "text-yellow-600"
                      : "text-gray-400"
                    }`}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.has(currentQuestionData.originalIndex) ? "Flagged" : "Flag"}
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
                          onClick={() => {
                            if (!reviewMode) {
                              setAnswers(prev => ({
                                ...prev,
                                [currentQuestionData.originalIndex]: key
                              }));
                            }
                          }}
                          disabled={isSubmitting || reviewMode}
                          className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${answers[currentQuestionData.originalIndex] === key
                              ? reviewMode
                                ? key === currentQuestionData.answer
                                  ? "border-green-500 bg-green-50 text-green-800"
                                  : "border-red-500 bg-red-50 text-red-800"
                                : "border-blue-500 bg-blue-50 text-blue-800"
                              : reviewMode && key === currentQuestionData.answer
                                ? "border-green-500 bg-green-50 text-green-800"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          aria-pressed={answers[currentQuestionData.originalIndex] === key}
                        >
                          <span className="font-medium">{key}.</span> {value}
                        </button>
                      )
                    )}
                  </div>

                  {reviewMode && currentQuestionData.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{currentQuestionData.explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 pb-2">
                    {reviewMode ? (
                      <>
                        <Button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setShowResults(true)}
                            variant="outline"
                          >
                            Back to Results
                          </Button>
                          <Button
                            onClick={handleClose}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Finish Review
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div></div> {/* Empty spacer */}
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <RotateCw className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Next
                        </Button>
                      </>
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
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${score >= 70
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
              {assessmentData.data?.assessment?.map((q, index) => (
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
                  <div className="mt-2">
                    <p className="text-sm">
                      Your answer:{" "}
                      <span
                        className={`font-medium ${answers[index] === q.answer
                            ? "text-green-600"
                            : answers[index] === ""
                              ? "text-gray-500"
                              : "text-red-600"
                          }`}
                      >
                        {answers[index] === "" ? "Time expired (not answered)" : answers[index] || "Not answered"}
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
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={enterReviewMode}
                variant="outline"
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Questions
              </Button>
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Assessment List
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}