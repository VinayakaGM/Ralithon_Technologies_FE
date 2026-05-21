"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import UserService from "@/services/users.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import {formatDate} from "@/utils/dateFormat"

interface Submission {
  submissionId: number;
  assessmentName: string;
  assessmentType: string;
  totalScored: number;
  assessmentScored: number;
  correctAnswer: number;
  totalQuestion: number;
  attemptQuestion: number;
  incorrectAnswer: number;
  completedOn: string;
}

interface Assessment {
  assessmentId: number;
  assessmentSubmit: Submission[];
}

interface GroupedAssessment {
  assessmentId: number;
  assessmentName: string;
  assessmentType: string;
  totalAttempts: number;
  scores: string;
  recentCompletedOn: string;
  bestScore: number;
  bestPercentage: number;
  submissions: Submission[];
  averageScore: number;
  improvement: number;
}

export default function EnrolledAssessmentTab() {
  const [activeTab, setActiveTab] = useState("assessments");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).userId : null;
    const fetchAssessments = async () => {
      try {
        const response = await UserService.getUserAssessments(userId);

        if (response && response.data) {
          setAssessments(response.data);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-amber-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90)
      return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (percentage >= 80) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (percentage >= 70)
      return "bg-gradient-to-r from-amber-500 to-yellow-500";
    if (percentage >= 60) return "bg-gradient-to-r from-orange-500 to-red-400";
    return "bg-gradient-to-r from-red-500 to-pink-500";
  };

  const getBadgeClass = (type: string) => {
    return type.toLowerCase() === "paid"
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600";
  };

  // Group assessments by assessment name and get required data
  const groupedAssessments: GroupedAssessment[] = assessments
    .filter(
      (assessment) =>
        assessment.assessmentSubmit && assessment.assessmentSubmit.length > 0
    )
    .map((assessment) => {
      const submissions = assessment.assessmentSubmit;
      const firstSubmission = submissions[0];

      // Sort submissions by completion date (most recent first)
      const sortedSubmissions = [...submissions].sort(
        (a, b) =>
          new Date(b.completedOn).getTime() - new Date(a.completedOn).getTime()
      );

      // Get scores string (e.g., "80/100, 30/100, 20/100")
      const scores = sortedSubmissions
        .map((sub) => `${sub.assessmentScored}/${sub.totalScored}`)
        .join(", ");

      // Get best score and average
      const bestScore = Math.max(
        ...submissions.map((sub) => sub.assessmentScored)
      );
      const bestPercentage = Math.round(
        (bestScore / firstSubmission.totalScored) * 100
      );
      const averageScore = Math.round(
        submissions.reduce((sum, sub) => sum + sub.assessmentScored, 0) /
          submissions.length
      );

      // Calculate improvement (latest vs first attempt)
      const improvement =
        submissions.length > 1
          ? sortedSubmissions[0].assessmentScored -
            sortedSubmissions[sortedSubmissions.length - 1].assessmentScored
          : 0;

      return {
        assessmentId: assessment.assessmentId,
        assessmentName: firstSubmission.assessmentName,
        assessmentType: firstSubmission.assessmentType,
        totalAttempts: submissions.length,
        scores: scores,
        recentCompletedOn: sortedSubmissions[0].completedOn,
        bestScore: bestScore,
        bestPercentage: bestPercentage,
        submissions: sortedSubmissions,
        averageScore: averageScore,
        improvement: improvement,
      };
    });

  const toggleExpanded = (assessmentId: number) => {
    const newExpanded = new Set(expandedAssessments);
    if (newExpanded.has(assessmentId)) {
      newExpanded.delete(assessmentId);
    } else {
      newExpanded.add(assessmentId);
    }
    setExpandedAssessments(newExpanded);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Assessment..." />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-10"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Assessments Dashboard
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Track your performance and celebrate your progress
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                {groupedAssessments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Assessments
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {groupedAssessments.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Best Performance
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.max(
                              ...groupedAssessments.map((a) => a.bestPercentage)
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Attempts
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {groupedAssessments.reduce(
                              (sum, a) => sum + a.totalAttempts,
                              0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assessment Cards */}
                <div className="space-y-6">
                  {groupedAssessments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full opacity-10"></div>
                        <AlertCircle className="w-16 h-16 mx-auto text-gray-400 relative" />
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-gray-900">
                        No assessments found
                      </h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        Start taking assessments to see your progress and
                        performance metrics here.
                      </p>
                    </div>
                  ) : (
                    groupedAssessments.map((assessment) => (
                      <Card
                        key={assessment.assessmentId}
                        className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-xl font-bold text-gray-900">
                                  {assessment.assessmentName}
                                </CardTitle>

                                <Badge
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${getBadgeClass(
                                    assessment.assessmentType
                                  )}`}
                                >
                                  {assessment.assessmentType}
                                </Badge>
                              </div>
                              <CardDescription className="text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Last completed: {formatDate(assessment.recentCompletedOn)}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full"
                              >
                                {assessment.totalAttempts} attempt
                                {assessment.totalAttempts > 1 ? "s" : ""}
                              </Badge>
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-6">
                            {/* Score Section */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-600 mb-2">
                                    Best Score
                                  </p>
                                  <p
                                    className={`text-3xl font-bold ${getScoreColor(
                                      assessment.bestPercentage
                                    )}`}
                                  >
                                    {assessment.bestPercentage}%
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {assessment.bestScore}/
                                    {assessment.submissions[0].totalScored}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-600 mb-2">
                                    Average Score
                                  </p>
                                  <p className="text-3xl font-bold text-blue-600">
                                    {Math.round(
                                      (assessment.averageScore /
                                        assessment.submissions[0].totalScored) *
                                        100
                                    )}
                                    %
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {assessment.averageScore}/
                                    {assessment.submissions[0].totalScored}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-600 mb-2">
                                    Improvement
                                  </p>
                                  <p
                                    className={`text-3xl font-bold ${
                                      assessment.improvement >= 0
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {assessment.improvement >= 0 ? "+" : ""}
                                    {assessment.improvement}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    points
                                  </p>
                                </div>
                              </div>

                              <div className="mt-6">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="font-medium text-gray-700">
                                    Progress
                                  </span>
                                  <span
                                    className={`font-bold ${getScoreColor(
                                      assessment.bestPercentage
                                    )}`}
                                  >
                                    {assessment.bestPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-full ${getProgressColor(
                                      assessment.bestPercentage
                                    )} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                                    style={{
                                      width: `${assessment.bestPercentage}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Scores Overview */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">All Scores:</span>
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                  {assessment.scores}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  toggleExpanded(assessment.assessmentId)
                                }
                                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                              >
                                View All Attempts
                                {expandedAssessments.has(
                                  assessment.assessmentId
                                ) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Expanded Details */}
                            {expandedAssessments.has(
                              assessment.assessmentId
                            ) && (
                              <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 animate-in slide-in-from-top-5 duration-300">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                  Detailed Attempt History
                                </h4>
                                <div className="space-y-3">
                                  {assessment.submissions.map(
                                    (submission, index) => (
                                      <div
                                        key={submission.submissionId}
                                        className="bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                              {assessment.submissions.length -
                                                index}
                                            </div>
                                            <span className="font-medium text-gray-900">
                                              Attempt{" "}
                                              {assessment.submissions.length -
                                                index}
                                            </span>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="text-sm font-semibold"
                                          >
                                            {Math.round(
                                              (submission.assessmentScored /
                                                submission.totalScored) *
                                                100
                                            )}
                                            %
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                                            <p className="text-gray-600">
                                              Score
                                            </p>
                                            <p className="font-bold text-gray-900">
                                              {submission.assessmentScored}/
                                              {submission.totalScored}
                                            </p>
                                          </div>
                                          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                                            <p className="text-gray-600">
                                              Attempted
                                            </p>
                                            <p className="font-bold text-blue-600">
                                              {submission.attemptQuestion}/
                                              {submission.totalQuestion}
                                            </p>
                                          </div>
                                          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                                            <p className="text-gray-600">
                                              Correct
                                            </p>
                                            <p className="font-bold text-emerald-600">
                                              {submission.correctAnswer}
                                            </p>
                                          </div>
                                          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                                            <p className="text-gray-600">
                                              Incorrect
                                            </p>
                                            <p className="font-bold text-red-600">
                                              {submission.incorrectAnswer}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                                          📅 Completed: {formatDate(submission.completedOn, true)}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
