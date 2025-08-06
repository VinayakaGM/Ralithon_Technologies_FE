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
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import userService, {
  EnrolledCourse,
  CourseDetails,
} from "@/services/users.service";
import authService from "@/services/auth.service";
import YouTube from "react-youtube";

export function CoursesTab() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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

  if (userId === null && !loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading user data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBackToCourses}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{selectedCourse.courseName}</h1>
            <p className="text-gray-600" style={{ fontSize: "13px" }}>
              {selectedCourse.remainingDays}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-3">
              {selectedVideo && (
                <div className="aspect-w-16 aspect-h-9">
                  <YouTube
                    videoId={extractVideoId(selectedVideo) ?? undefined}
                    opts={{
                      width: "100%",
                      height: "500px",
                      playerVars: {
                        autoplay: 1,
                      },
                    }}
                    className="w-full rounded-lg overflow-hidden"
                  />
                </div>
              )}
            </div>

            {/* Video List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Course Content</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {selectedCourse.coursePlayListDTOList.map((video, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedVideo === video.videoUrl
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedVideo(video.videoUrl)}
                  >
                    <p className="text-sm font-medium">{video.topicName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {video.videoUrl}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        No courses enrolled
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
        <p className="text-gray-600">Your current learning programs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    {course.durationInWeek} week program
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    course.courseStatus === "Active" ? "secondary" : "default"
                  }
                  className={
                    course.courseStatus !== "Active"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {course.courseStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <p style={{ fontSize: "12px" }}>
                    Starts: {course.startDate.split(" ")[0]}
                  </p>
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <p style={{ fontSize: "12px" }}>
                    Ends: {course.endDate.split(" ")[0]}
                  </p>
                </div>
              </div>

              {course.courseStatus === "Active" && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Course is currently active
                  </p>
                </div>
              )}

              {course.courseStatus !== "Active" && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Course completed on {course.endDate.split(" ")[0]}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 ">
                <Button
                  className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800"
                  onClick={() => handleContinueLearning(course.id)}
                >
                  {course.courseStatus === "Active"
                    ? "Continue Learning"
                    : "View Course"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
