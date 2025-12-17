"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Play,
  GraduationCap,
  Calendar,
  Users,
  Star,
} from "lucide-react";
import userService, {
  EnrolledCourse,
  CourseDetails,
} from "@/services/users.service";
import YouTube from "react-youtube";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function EnrolledCoursesTab() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [applyingProject, setApplyingProject] = useState(false);
  const [applyStatus, setApplyStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = localStorage.getItem("userDetails");
      if (!currentUser) return;

      try {
        const user = JSON.parse(currentUser);
        if (user?.userId) {
          setUserId(user.userId);
          setLoading(true);
          const response = await userService.getEnrolledCourses(user.userId);
          if (response.success) {
            setCourses(response.data);
          } else {
            setError(response.message || "Failed to fetch courses");
          }
        }
      } catch (error) {
        setError("Failed to load user data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleContinueLearning = async (courseId: number) => {
    if (userId === null) return;
    setLoading(true);

    try {
      const response = await userService.getUserCourseDetails(userId, courseId);

      if (response.success) {
        setSelectedCourse(response.data);
        if (response.data.coursePlayListDTOList.length > 0) {
          setSelectedVideo(response.data.coursePlayListDTOList[0].videoUrl);
        }
      } else {
        setError(response.message || "Failed to fetch course details");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading course details");
      console.error("Error fetching course details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToCourses = () => {
    router.push("/");
  };

  const handleApplyProject = async (
    userId: number | null,
    courseId: number
  ) => {
    if (userId === null) return;
    setApplyingProject(true);
    setApplyStatus(null);

    try {
      const response = await userService.applyProject(userId, courseId);

      if (response.success) {
        setApplyStatus({
          success: true,
          message: "Project application submitted successfully!",
        });
        handleContinueLearning(courseId);
      } else {
        setApplyStatus({
          success: false,
          message: response.message || "Failed to apply for project",
        });
      }
    } catch (err) {
      setApplyStatus({
        success: false,
        message: "An unexpected error occurred",
      });
      console.error("Error applying for project:", err);
    } finally {
      setApplyingProject(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedVideo(null);
  };

  if (loading && userId === null) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1">
            <AdminHeader />
            <main className="p-6 min-h-[calc(100vh-80px)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600">Loading your courses...</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (selectedCourse) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1">
            <AdminHeader />
            <main className="p-6 min-h-[calc(100vh-80px)]">
              <div className="max-w-7xl mx-auto space-y-6">
                <Button
                  variant="ghost"
                  onClick={handleBackToCourses}
                  className="flex items-center gap-2 hover:bg-white/70 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Courses
                </Button>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {selectedCourse.courseName}
                      </h1>
                      <p className="text-slate-600 mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedCourse.remainingDays}
                      </p>
                    </div>

                    {/* Add Apply for Project button here */}
                    <div className="flex flex-col items-end gap-2">
                      {selectedCourse.projectApply ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 px-3 py-2">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Project Applied
                        </Badge>
                      ) : (
                        <Button
                          onClick={() =>
                            handleApplyProject(userId, selectedCourse.courseId)
                          }
                          disabled={applyingProject}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          {applyingProject
                            ? "Applying..."
                            : "Apply for Project"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Application status message */}
                  {applyStatus && (
                    <div
                      className={`p-4 rounded-xl ${applyStatus.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {applyStatus.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <p
                          className={
                            applyStatus.success
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {applyStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Video Player */}
                    <div className="lg:col-span-3">
                      {selectedVideo && (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                          <YouTube
                            videoId={extractVideoId(selectedVideo) ?? undefined}
                            opts={{
                              width: "100%",
                              height: "500px",
                              playerVars: {
                                autoplay: 1,
                              },
                            }}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* Video List */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Course Content
                      </h2>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {selectedCourse.coursePlayListDTOList.map(
                          (video, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedVideo === video.videoUrl
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
                                : "bg-white/70 hover:bg-white/90 border border-slate-200 hover:shadow-lg"
                                }`}
                              onClick={() => setSelectedVideo(video.videoUrl)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg ${selectedVideo === video.videoUrl
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                  <Play className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 leading-tight">
                                    {video.topicName}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 truncate">
                                    Video {index + 1}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    My Learning Journey
                  </h1>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Continue your educational journey with our comprehensive
                    courses
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    Unable to load the courses at the moment. Please try again later.
                  </div>
                )}


                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="text-slate-600">Loading your courses...</p>
                    </div>
                  </div>
                )}

                {/* Empty State - Fixed to not take full page */}
                {!loading && !error && courses.length === 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-12 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                        <GraduationCap className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-slate-900">
                          No Courses Found
                        </h3>
                        <p className="text-slate-600">
                          You haven't enrolled in any courses yet. Start your
                          learning journey today!
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200"
                        onClick={handleNavigateToCourses}
                      >
                        Browse Courses
                      </Button>
                    </div>
                  </div>
                )}

                {/* Courses Grid */}
                {!loading && !error && courses.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        Enrolled Courses ({courses.length})
                      </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className="group bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden"
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {course.name}
                                </CardTitle>
                                <CardDescription className="text-slate-600 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {course.durationInWeek} week program
                                </CardDescription>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`px-3 py-1 rounded-full font-medium ${course.courseStatus === "Active"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  }`}
                              >
                                {course.courseStatus}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-600">
                                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                  <span className="font-medium">Start:</span>
                                </div>
                                <span className="text-slate-700 font-medium">
                                  {course.startDate.split(" ")[0]}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-600">
                                  <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
                                  <span className="font-medium">End:</span>
                                </div>
                                <span className="text-slate-700 font-medium">
                                  {course.endDate.split(" ")[0]}
                                </span>
                              </div>
                            </div>

                            {/* Status Card */}
                            <div
                              className={`p-4 rounded-xl ${course.courseStatus === "Active"
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                                : "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Star
                                  className={`w-5 h-5 ${course.courseStatus === "Active"
                                    ? "text-blue-600"
                                    : "text-emerald-600"
                                    }`}
                                />
                                <p
                                  className={`text-sm font-medium ${course.courseStatus === "Active"
                                    ? "text-blue-700"
                                    : "text-emerald-700"
                                    }`}
                                >
                                  {course.courseStatus === "Active"
                                    ? "Course is currently active"
                                    : `Course completed on ${course.endDate.split(" ")[0]
                                    }`}
                                </p>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                              onClick={() => handleContinueLearning(course.id)}
                              disabled={loading}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {course.courseStatus === "Active"
                                ? "Continue Learning"
                                : "View Course"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
