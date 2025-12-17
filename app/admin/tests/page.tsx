"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  Edit2,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface StudentTestAttempt {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  attemptNumber: number;
  maxAttempts: number;
  paidAttempts: number;
  completedAt: string;
  timeSpent: number;
  isPassed: boolean;
}

export default function AdminTestsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentTestAttempt[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentTestAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "passed" | "failed">("all");
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("date");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentTestAttempt | null>(null);
  const [newPaidAttempts, setNewPaidAttempts] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const passPercentage = 60;

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user || user.userType !== "ROLE_ADMIN") {
      router.push("/");
      return;
    }
    setCurrentUser(user);

    // Load all test results from localStorage
    const allResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    const mockStudents: StudentTestAttempt[] = allResults.map((result: any, idx: number) => ({
      id: `${result.userId}-${idx}`,
      userId: result.userId,
      userName: `Student ${result.userId}`,
      userEmail: `student${result.userId}@example.com`,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      attemptNumber: idx + 1,
      maxAttempts: 2,
      paidAttempts: 0,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      isPassed: result.score >= passPercentage,
    }));

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
    setLoading(false);
  }, [router]);

  // Filter and sort logic
  useEffect(() => {
    let filtered = students;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === "passed") {
      filtered = filtered.filter((s) => s.isPassed);
    } else if (filterStatus === "failed") {
      filtered = filtered.filter((s) => !s.isPassed);
    }

    // Sort
    if (sortBy === "score") {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.userName.localeCompare(b.userName));
    }

    setFilteredStudents(filtered);
  }, [searchQuery, filterStatus, sortBy, students]);

  const handleEditAttempts = (student: StudentTestAttempt) => {
    setSelectedStudent(student);
    setNewPaidAttempts(student.paidAttempts);
    setShowEditModal(true);
  };

  const handleSaveAttempts = () => {
    if (!selectedStudent) return;

    // Update in localStorage (in real app, update in database)
    const updated = students.map((s) =>
      s.id === selectedStudent.id
        ? { ...s, paidAttempts: newPaidAttempts, maxAttempts: 2 + newPaidAttempts }
        : s
    );
    setStudents(updated);
    setShowEditModal(false);

    // In real app, sync with backend
    localStorage.setItem(
      `paid_attempts_${selectedStudent.userId}`,
      String(newPaidAttempts)
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = {
    totalAttempts: students.length,
    passedCount: students.filter((s) => s.isPassed).length,
    failedCount: students.filter((s) => !s.isPassed).length,
    avgScore:
      students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.score, 0) / students.length)
        : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Student Test Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track, monitor, and manage student test attempts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAttempts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Passed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.passedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.failedCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.avgScore}%</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Correct/Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Attempts</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Time</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.userName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.userEmail}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              student.score >= 80
                                ? "bg-green-100 text-green-800"
                                : student.score >= 60
                                  ? "bg-blue-100 text-blue-800"
                                  : student.score >= 40
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {student.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {student.correctAnswers}/{student.totalQuestions}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {student.attemptNumber}/{student.maxAttempts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.isPassed ? (
                          <div className="flex items-center justify-center space-x-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Failed</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{formatTime(student.timeSpent)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(student.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditAttempts(student)}
                            className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors"
                            title="Edit Attempts"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No test records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Attempts Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Increase Attempts for {selectedStudent.userName}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Paid Attempts
                </label>
                <input
                  type="text"
                  value={selectedStudent.paidAttempts}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Paid Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPaidAttempts}
                  onChange={(e) => setNewPaidAttempts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Allowed Attempts:</strong> 2 (free) + {newPaidAttempts} (paid) ={" "}
                  {2 + newPaidAttempts}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAttempts} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Test Details - {selectedStudent.userName}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold text-indigo-600">{selectedStudent.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-semibold ${selectedStudent.isPassed ? "text-green-600" : "text-red-600"}`}>
                    {selectedStudent.isPassed ? "Passed" : "Failed"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedStudent.correctAnswers}/{selectedStudent.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(selectedStudent.timeSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attempt Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedStudent.attemptNumber}/{selectedStudent.maxAttempts}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedStudent.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowEditModal(true);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Attempts
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}