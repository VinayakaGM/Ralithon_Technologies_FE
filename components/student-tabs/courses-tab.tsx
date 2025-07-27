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
import { BookOpen, Clock, Users, Star } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Web Development Basics",
    instructor: "Dr. Sarah Johnson",
    progress: 85,
    totalLessons: 24,
    completedLessons: 20,
    duration: "8 weeks",
    students: 156,
    rating: 4.8,
    status: "active",
    nextLesson: "CSS Grid Layout",
  },
  {
    id: 2,
    title: "Advanced React Development",
    instructor: "Prof. Michael Chen",
    progress: 60,
    totalLessons: 18,
    completedLessons: 11,
    duration: "6 weeks",
    students: 89,
    rating: 4.9,
    status: "active",
    nextLesson: "State Management with Redux",
  },
  {
    id: 3,
    title: "Database Management Systems",
    instructor: "Dr. Emily Rodriguez",
    progress: 100,
    totalLessons: 16,
    completedLessons: 16,
    duration: "5 weeks",
    students: 203,
    rating: 4.7,
    status: "completed",
    completedAt: "2024-01-15",
  },
  {
    id: 4,
    title: "Python for Data Science",
    instructor: "Prof. David Kim",
    progress: 25,
    totalLessons: 20,
    completedLessons: 5,
    duration: "10 weeks",
    students: 134,
    rating: 4.6,
    status: "active",
    nextLesson: "NumPy Arrays and Operations",
  },
];

export function CoursesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
        <p className="text-gray-600">
          Track your learning progress across all courses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>by {course.instructor}</CardDescription>
                </div>
                <Badge
                  variant={
                    course.status === "completed" ? "default" : "secondary"
                  }
                  className={
                    course.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {course.status.charAt(0).toUpperCase() +
                    course.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {course.completedLessons}/{course.totalLessons} lessons
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
                <div className="text-right text-sm text-gray-600">
                  {course.progress}% complete
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {course.students} students
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.totalLessons} lessons
                </div>
              </div>

              {course.status === "active" && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Next Lesson:
                  </p>
                  <p className="text-sm text-blue-700">{course.nextLesson}</p>
                </div>
              )}

              {course.status === "completed" && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    Course Completed!
                  </p>
                  <p className="text-sm text-green-700">
                    Finished on {course.completedAt}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button className="flex-1">
                  {course.status === "completed"
                    ? "Review Course"
                    : "Continue Learning"}
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
