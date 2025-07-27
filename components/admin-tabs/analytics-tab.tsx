import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BookOpen, Award, BarChart3 } from "lucide-react";

const analyticsData = {
  overview: {
    totalStudents: 342,
    activeStudents: 298,
    totalCourses: 12,
    completedCourses: 156,
    certificatesIssued: 89,
    averageScore: 82.5,
  },
  trends: {
    studentGrowth: 12.5,
    courseCompletion: 87.3,
    averageScoreChange: 3.2,
    engagementRate: 94.1,
  },
  coursePopularity: [
    { name: "Web Development Basics", students: 156, completion: 89 },
    { name: "Advanced React", students: 89, completion: 76 },
    { name: "Database Management", students: 203, completion: 92 },
    { name: "Python for Data Science", students: 134, completion: 68 },
  ],
  performanceMetrics: {
    passRate: 87.2,
    averageTimeToComplete: "6.5 weeks",
    retentionRate: 91.4,
    satisfactionScore: 4.6,
  },
};

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Comprehensive insights into student performance and platform usage
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.overview.totalStudents}
              </div>
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">
                +{analyticsData.trends.studentGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.overview.activeStudents}
              </div>
            </div>
            <div className="text-sm text-gray-600">Active Students</div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(
                (analyticsData.overview.activeStudents /
                  analyticsData.overview.totalStudents) *
                  100
              )}
              % of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.overview.totalCourses}
              </div>
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
            <div className="text-xs text-gray-500 mt-1">
              {analyticsData.overview.completedCourses} completions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.overview.certificatesIssued}
              </div>
            </div>
            <div className="text-sm text-gray-600">Certificates</div>
            <div className="text-xs text-gray-500 mt-1">Issued this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.overview.averageScore}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">
                +{analyticsData.trends.averageScoreChange}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {analyticsData.trends.engagementRate}%
            </div>
            <div className="text-sm text-gray-600">Engagement</div>
            <div className="text-xs text-gray-500 mt-1">Daily active rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Course Popularity & Completion Rates</CardTitle>
          <CardDescription>
            Most popular courses and their completion statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.coursePopularity.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{course.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{course.students} students</span>
                      <span>{course.completion}% completion</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Enrollment</span>
                        <span>{course.students}/200</span>
                      </div>
                      <Progress
                        value={(course.students / 200) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion</span>
                        <span>{course.completion}%</span>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pass Rate</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {analyticsData.performanceMetrics.passRate}%
                </Badge>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Retention Rate</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {analyticsData.performanceMetrics.retentionRate}%
                </Badge>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg. Completion Time</span>
              <Badge variant="outline">
                {analyticsData.performanceMetrics.averageTimeToComplete}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Satisfaction Score</span>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700"
                >
                  {analyticsData.performanceMetrics.satisfactionScore}/5.0
                </Badge>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trends</CardTitle>
            <CardDescription>Month-over-month changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Student Growth</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  +{analyticsData.trends.studentGrowth}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Course Completion</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {analyticsData.trends.courseCompletion}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Score</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  +{analyticsData.trends.averageScoreChange}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement Rate</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {analyticsData.trends.engagementRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
