"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Flag,
  RotateCw,
  Eye,
  CheckCircle,
  XCircle,
  Code,
  Calculator,
  Languages,
  Play,
  Terminal,
  Cpu,
  FileText,
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
  testCases?: TestCase[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface AssessmentData {
  assessment: Question[];
  attemptId?: string;
  assessmentId?: number;
  courseId?: number;
  courseName?: string;
}

interface CompilationResult {
  success: boolean;
  output: string;
  error: string;
  testCases?: {
    passed: number;
    total: number;
    results: {
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }[];
  };
}

const TEST_DURATION = 30 * 60;
const QUESTION_TIME_LIMIT = 30;

// Code Editor Component
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  language?: string;
  onLanguageChange?: (language: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  disabled = false,
  language = "java",
  onLanguageChange
}) => {
  return (
    <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Code Editor</span>
        </div>
        <div className="flex items-center space-x-2">
          {onLanguageChange && (
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {language.toUpperCase()}
          </Badge>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`// Write your ${language} code here...\n// Use proper formatting and comments`}
        disabled={disabled}
        className="font-mono text-sm min-h-[300px] w-full resize-none border-0 rounded-none focus-visible:ring-0 bg-white"
        style={{
          fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
          lineHeight: '1.5',
          tabSize: 2
        }}
      />
      <div className="bg-gray-50 px-4 py-1.5 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Line: 1, Col: 1</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

// Compiler Output Component
interface CompilerOutputProps {
  result: CompilationResult | null;
  isRunning: boolean;
}

const CompilerOutput: React.FC<CompilerOutputProps> = ({ result, isRunning }) => {
  return (
    <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center space-x-2">
        <Terminal className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Execution Results</span>
        {result && (
          <Badge
            variant={result.success ? "default" : "destructive"}
            className="text-xs"
          >
            {result.success ? "Success" : "Failed"}
          </Badge>
        )}
      </div>
      <div className="p-3 bg-white min-h-[120px] max-h-[120px] overflow-auto font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center space-x-2 text-gray-600">
            <Cpu className="h-4 w-4 animate-pulse" />
            <span>Compiling and executing...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            {result.error ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span className="font-medium">Compilation Error</span>
                </div>
                <pre className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200 whitespace-pre-wrap">
                  {result.error}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-medium">Execution Successful</span>
                </div>
                {result.output && (
                  <pre className="text-gray-700 text-xs bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">
                    {result.output}
                  </pre>
                )}
                {result.testCases && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-600">Test Cases:</span>
                    <Badge variant={result.testCases.passed === result.testCases.total ? "default" : "secondary"} className="text-xs">
                      {result.testCases.passed}/{result.testCases.total} passed
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Run your code to see results</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Assessment Header Component
const AssessmentHeader: React.FC<{
  timeLeft: number;
  currentSection: string;
  currentQuestion: number;
  totalQuestions: number;
}> = ({ timeLeft, currentSection, currentQuestion, totalQuestions }) => {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="bg-gray-900 text-white">
      {/* Main Header */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo.jpeg"   // update path
              alt="Ralithon Logo"
              width={38}
              height={38}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-bold">Ralithon Technologies Assessment</h1>
              <p className="text-gray-300 text-sm mt-1">
                {currentSection} Section - {currentQuestion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-400" />
              <span className="font-mono font-bold text-green-400 text-lg">
                {formatTime(timeLeft)}
              </span>
              <span className="text-gray-300 text-sm ml-2">
                Time Left
              </span>
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

// // Answer Status Legend Component
// const AnswerStatusLegend: React.FC = () => {
//   return (
//     <div className="status-legend">
//       <div className="status-item">
//         <span className="status-color answered"></span>
//         <span className="status-label">Answered</span>
//       </div>
//       <div className="status-item">
//         <span className="status-color not-answered"></span>
//         <span className="status-label">Not Answered</span>
//       </div>
//       <div className="status-item">
//         <span className="status-color marked"></span>
//         <span className="status-label">Marked for Review</span>
//       </div>
//     </div>
//   );
// };

export default function TakeTestPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({});
  const [currentSection, setCurrentSection] = useState<'APTITUDE' | 'ENGLISH' | 'CODING'>('APTITUDE');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("java");

  // Gradient background style for buttons
  const gradientStyle = {
    background: 'linear-gradient(270deg, rgb(6 132 190) 0%, rgb(2 116 186) 100%)'
  };

  // Section configuration
  const sections = [
    {
      name: 'APTITUDE' as const,
      title: 'Aptitude',
      icon: <Calculator className="h-3 w-3" />,
      color: 'bg-blue-500',
    },
    {
      name: 'ENGLISH' as const,
      title: 'English',
      icon: <Languages className="h-3 w-3" />,
      color: 'bg-green-500',
    },
    {
      name: 'CODING' as const,
      title: 'Coding',
      icon: <Code className="h-3 w-3" />,
      color: 'bg-purple-500',
    }
  ];

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

        // Process questions
        const processedQuestions = data.assessment.map((question, index) => ({
          ...question,
          type: !question.options || Object.keys(question.options).length === 0 ? 'programming' : 'multiple_choice',
          section: question.section || ['APTITUDE', 'ENGLISH', 'CODING'][index % 3] as any,
          testCases: question.testCases || [{
            input: "programming,python",
            expectedOutput: "gramming"
          }]
        }));

        setAssessmentData({ ...data, assessment: processedQuestions });
        setQuestions(processedQuestions);

        // Initialize answers
        const initialAnswers: Record<number, string> = {};
        processedQuestions.forEach((question, index) => {
          if (question.userAnswer) {
            initialAnswers[index] = question.userAnswer;
          }
        });
        setAnswers(initialAnswers);

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

  // Timers
  useEffect(() => {
    if (timeLeft <= 0 || showResults || !questions.length) {
      if (timeLeft <= 0 && !showResults) {
        handleSubmitAssessment(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults, questions.length]);

  useEffect(() => {
    if (showResults || !questions.length) return;

    const timeSpent = questionTimeSpent[currentQuestionIndex] || 0;
    const remaining = Math.max(0, QUESTION_TIME_LIMIT - timeSpent);
    setQuestionTimeRemaining(remaining);
  }, [currentQuestionIndex, showResults, questions.length]);

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

  const handleTimeUp = async () => {
    const timeSpent = QUESTION_TIME_LIMIT - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));
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
    const updatedAnswers = { ...answers, [currentQuestionIndex]: optionKey };
    setAnswers(updatedAnswers);
    saveAnswerToServer(currentQuestionIndex, optionKey);
  };

  const handleCodeAnswerChange = (code: string) => {
    const updatedAnswers = { ...answers, [currentQuestionIndex]: code };
    setAnswers(updatedAnswers);
  };

  // Professional code compilation
  const handleRunCode = async () => {
    if (!answers[currentQuestionIndex]?.trim()) {
      toast.error("Please write some code before running");
      return;
    }

    if (!currentUser) {
      toast.error("Please login to compile code");
      return;
    }

    setIsRunningCode(true);
    setCompilationResult(null);

    try {
      // Simulate API call to backend compiler
      const result = await new Promise<CompilationResult>((resolve) => {
        setTimeout(() => {
          const code = answers[currentQuestionIndex];

          // Basic validation
          if (selectedLanguage === "java" && !code.includes("class")) {
            resolve({
              success: false,
              output: "",
              error: "Error: Java code must contain a class definition"
            });
            return;
          }

          // Simulate successful execution for valid code
          if (code.trim().length > 10) {
            resolve({
              success: true,
              output: "gramming",
              error: "",
              testCases: {
                passed: 1,
                total: 1,
                results: [{
                  input: "programming,python",
                  expected: "gramming",
                  actual: "gramming",
                  passed: true
                }]
              }
            });
          } else {
            resolve({
              success: false,
              output: "",
              error: "Compilation Error: Please write complete code solution"
            });
          }
        }, 1500);
      });

      setCompilationResult(result);
      toast.success(result.success ? "Code executed successfully" : "Compilation failed");

    } catch (error) {
      toast.error("Failed to compile code");
      setCompilationResult({
        success: false,
        output: "",
        error: "Network error: Unable to reach compiler service"
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const moveToNextQuestion = async () => {
    const timeSpent = QUESTION_TIME_LIMIT - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));

    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer && questions[currentQuestionIndex].type === 'programming') {
      await saveAnswerToServer(currentQuestionIndex, currentAnswer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCompilationResult(null);
    } else {
      handleSubmitAssessment(false);
    }
  };

  const handleNextQuestion = async () => {
    await moveToNextQuestion();
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const timeSpent = QUESTION_TIME_LIMIT - questionTimeRemaining;
      setQuestionTimeSpent(prev => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
      }));

      const currentAnswer = answers[currentQuestionIndex];
      if (currentAnswer && questions[currentQuestionIndex].type === 'programming') {
        await saveAnswerToServer(currentQuestionIndex, currentAnswer);
      }

      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCompilationResult(null);
    }
  };

  const handleQuestionNavigation = async (newIndex: number) => {
    if (newIndex === currentQuestionIndex) return;

    const timeSpent = QUESTION_TIME_LIMIT - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));

    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer && questions[currentQuestionIndex].type === 'programming') {
      await saveAnswerToServer(currentQuestionIndex, currentAnswer);
    }

    setCurrentQuestionIndex(newIndex);
    setCompilationResult(null);
  };

  const handleSectionChange = async (section: 'APTITUDE' | 'ENGLISH' | 'CODING') => {
    const timeSpent = QUESTION_TIME_LIMIT - questionTimeRemaining;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent
    }));

    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer && questions[currentQuestionIndex].type === 'programming') {
      await saveAnswerToServer(currentQuestionIndex, currentAnswer);
    }

    setCurrentSection(section);
    const firstInSection = questions.findIndex(q => q.section === section);
    if (firstInSection !== -1) {
      setCurrentQuestionIndex(firstInSection);
    }
    setCompilationResult(null);
  };

  const handleSubmitAssessment = async (forceSubmit: boolean) => {
    if (!forceSubmit && getAnsweredQuestionsCount() < questions.length) {
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
        setShowResults(true);

        // Store results
        const resultData = {
          userId: currentUser.userId,
          score: calculatedScore,
          correctAnswers: result.data.correct,
          totalQuestions: result.data.totalQuestions,
          timeSpent: TEST_DURATION - timeLeft,
          assessmentId: assessmentData.assessmentId,
          courseName: assessmentData.courseName
        };

        const existing = JSON.parse(localStorage.getItem("testResults") || "[]");
        existing.push(resultData);
        localStorage.setItem("testResults", JSON.stringify(existing));

        sessionStorage.removeItem('assessmentData');
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
  }, [assessmentData, currentUser, timeLeft]);

  const toggleFlagQuestion = (questionIndex: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredQuestionsCount() / questions.length) * 100;
  };

  const isQuestionAnswered = (index: number) => {
    return answers[index] !== undefined && answers[index] !== '';
  };

  const getQuestionStatus = (index: number) => {
    return isQuestionAnswered(index) ? 'answered' : 'not-answered';
  };

  const getSectionProgress = (section: string) => {
    const sectionQuestions = questions.filter(q => q.section === section);
    const answered = sectionQuestions.filter(q => {
      const index = questions.findIndex(qu => qu.id === q.id);
      return isQuestionAnswered(index);
    }).length;
    return {
      total: sectionQuestions.length,
      answered,
      percentage: (answered / sectionQuestions.length) * 100
    };
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

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
  const currentSectionInfo = sections.find(s => s.name === currentQuestion.section);

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${score >= 70 ? "bg-green-100" : score >= 50 ? "bg-yellow-100" : "bg-red-100"
                  }`}>
                  {score >= 70 ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : score >= 50 ? (
                    <XCircle className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessment Complete</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Score: <span className="font-semibold text-blue-600">{score}%</span>
                </p>
                <div className="bg-white border rounded-lg p-4 inline-block">
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>Total: <span className="font-medium">{questions.length}</span></div>
                    <div>Answered: <span className="font-medium">{getAnsweredQuestionsCount()}</span></div>
                    <div>Correct: <span className="font-medium">{Math.round((score / 100) * questions.length)}</span></div>
                    <div>Time: <span className="font-medium">{formatTime(TEST_DURATION - timeLeft)}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => router.push("/assessments/result")}
                  size="sm"
                  style={gradientStyle}
                >
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ralithon Technologies Header */}
      <AssessmentHeader
        timeLeft={timeLeft}
        currentSection={currentSectionInfo?.title || 'Assessment'}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      {/* Answer Status Legend */}
      {/* <AnswerStatusLegend /> */}

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* <BookOpen className="h-4 w-4 text-gray-600" /> */}
                    <CardTitle className="text-base font-semibold">Question Palette</CardTitle>
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
                {/* Progress */}
                {/* <div className="bg-white border rounded-lg p-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Q{currentQuestionIndex + 1} of {questions.length}</span>
                    <span>{getAnsweredQuestionsCount()} answered</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-1.5" />
                </div> */}

                {/* Sections */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sections</h3>
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const progress = getSectionProgress(section.name);
                      const isCurrent = currentSection === section.name;
                      return (
                        <button
                          key={section.name}
                          onClick={() => handleSectionChange(section.name)}
                          className={`w-full p-2 rounded border text-left text-sm transition-colors ${isCurrent
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1 rounded ${section.color} text-white`}>
                                {section.icon}
                              </div>
                              <span className="font-medium">{section.title}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {progress.answered}/{progress.total}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Palette */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Questions</h3>
                    <span className="text-xs text-gray-500">{currentSectionInfo?.title}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {questions
                      .filter(q => q.section === currentSection)
                      .map((question, index) => {
                        const globalIndex = questions.findIndex(q => q.id === question.id);
                        return (
                          <button
                            key={globalIndex}
                            onClick={() => handleQuestionNavigation(globalIndex)}
                            className={`aspect-square rounded text-xs font-medium transition-colors ${globalIndex === currentQuestionIndex
                              ? "bg-blue-600 text-white"
                              : flaggedQuestions.has(globalIndex)
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                : getQuestionStatus(globalIndex) === 'answered'
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-white text-gray-600 border border-gray-300"
                              }`}
                          >
                            {globalIndex + 1}
                          </button>
                        );
                      })}
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
                    <div className={`p-2 rounded ${currentSectionInfo?.color} text-white`}>
                      {currentSectionInfo?.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {currentSectionInfo?.title} - Question {currentQuestionIndex + 1}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${questionTimeRemaining <= 10 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      {questionTimeRemaining}s
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                      className={`h-8 ${flaggedQuestions.has(currentQuestionIndex) ? "text-yellow-600" : "text-gray-400"
                        }`}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
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

                  {/* Content */}
                  {currentQuestion.type === 'programming' ? (
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700">Solution</h3>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleRunCode}
                            disabled={isRunningCode || !answers[currentQuestionIndex]?.trim()}
                            size="sm"
                            className="h-8"
                            style={gradientStyle}
                          >
                            {isRunningCode ? (
                              <RotateCw className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
                            Run
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 flex-1 min-h-0">
                        <CodeEditor
                          value={answers[currentQuestionIndex] || ''}
                          onChange={handleCodeAnswerChange}
                          disabled={isSaving}
                          language={selectedLanguage}
                          onLanguageChange={setSelectedLanguage}
                        />

                        <CompilerOutput
                          result={compilationResult}
                          isRunning={isRunningCode}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Options</h3>
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
                    <Button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      size="sm"
                      style={gradientStyle}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-legend {
          display: flex;
          justify-content: center;
          gap: 25px;
          padding: 15px;
          background-color: white;
          border-bottom: 1px solid #e0e0e0;
          font-size: 0.9em;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-color {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid #ccc;
        }

        .status-color.answered {
          background-color: #00c853;
        }

        .status-color.not-answered {
          background-color: #ffab00;
        }

        .status-color.marked {
          background-color: #2962ff;
        }
      `}</style>
    </div>
  );
}