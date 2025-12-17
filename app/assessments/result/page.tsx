"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  BarChart3,
  Download,
  Share2,
  ArrowRight,
  Target,
  Clock,
  BookOpen,
} from "lucide-react";

interface Answer {
  questionId: number;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  question: string;
  options: string[];
  category?: string;
}

interface TestResult {
  userId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: Answer[];
  completedAt: string;
  timeSpent: number;
}

 function TestResultPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "review">("overview");

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push("/assessments/pretest");
      return;
    }
    setCurrentUser(user);

    const results = JSON.parse(localStorage.getItem("testResults") || "[]");
    const latestResult = results[results.length - 1];

    if (latestResult) setResult(latestResult);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <Link href="/assessments/pretest">
            <Button>Back to Tests</Button>
          </Link>
        </div>
      </div>
    );
  }

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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
          <Link href="/student/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Score Card */}
        <div
          className={`${getScoreBgColor(score)} rounded-xl shadow p-6 mb-8 border-l-4 ${
            isPassed ? "border-l-green-500" : "border-l-red-500"
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
                <p className="text-green-700 font-semibold">✓ Passed</p>
              ) : (
                <p className="text-red-700 font-semibold">✗ Failed</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow border overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 text-center font-semibold ${
                activeTab === "overview"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-1" /> Overview
            </button>

            <button
              onClick={() => setActiveTab("review")}
              className={`flex-1 px-4 py-3 text-center font-semibold ${
                activeTab === "review"
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
                <p>✔ Correct Answers: <strong>{result.correctAnswers}</strong></p>
                <p>✘ Incorrect Answers: <strong>{result.totalQuestions - result.correctAnswers}</strong></p>
                <p>🕒 Time Taken: <strong>{formatTime(result.timeSpent)}</strong></p>
                <p>📅 Completed On: <strong>{new Date(result.completedAt).toLocaleString()}</strong></p>

                <div className="flex gap-3 mt-4">
                  <Button className="flex-1 flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Download Certificate
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Share Result
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-3">
                {result.answers.map((a, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                      className="w-full text-left p-3 hover:bg-gray-50 flex justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {a.isCorrect ? (
                          <CheckCircle2 className="text-green-600 h-5 w-5" />
                        ) : (
                          <XCircle className="text-red-600 h-5 w-5" />
                        )}
                        <strong>Question {i + 1}:</strong> <span>{a.question}</span>
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedQuestion === i ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {expandedQuestion === i && (
                      <div className="p-4 bg-gray-50 space-y-2 border-t">
                        {a.options.map((op, oi) => {
                          const isCorrect = oi === a.correctAnswer;
                          const isSelected = a.selectedAnswer === oi;
                          const isWrong = isSelected && !isCorrect;

                          return (
                            <div
                              key={oi}
                              className={`p-2 border rounded ${
                                isCorrect
                                  ? "bg-green-50 border-green-300"
                                  : isWrong
                                  ? "bg-red-50 border-red-300"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              {op}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mb-10">
          <Link href="/assessments/pretest">
            <Button className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Take Another Test
            </Button>
          </Link>

          <Link href="/student/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default function TestResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      }
    >
      <TestResultPageInner />
    </Suspense>
  );
}