import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, BarChart3 } from "lucide-react";

const assessmentResults = [
  {
    id: 1,
    studentName: "John Doe",
    assessmentTitle: "JavaScript Fundamentals Quiz",
    course: "Web Development Basics",
    score: 85,
    maxScore: 100,
    submittedAt: "2024-01-15 14:30",
    duration: "28 minutes",
    status: "completed",
  },
  {
    id: 2,
    studentName: "Jane Smith",
    assessmentTitle: "React Components Assessment",
    course: "Advanced React",
    score: 92,
    maxScore: 100,
    submittedAt: "2024-01-20 16:45",
    duration: "42 minutes",
    status: "completed",
  },
  {
    id: 3,
    studentName: "David Brown",
    assessmentTitle: "Database Design Quiz",
    course: "Database Management",
    score: 78,
    maxScore: 100,
    submittedAt: "2024-01-22 10:15",
    duration: "35 minutes",
    status: "completed",
  },
  {
    id: 4,
    studentName: "Sarah Wilson",
    assessmentTitle: "Python Basics Test",
    course: "Python for Beginners",
    score: 0,
    maxScore: 100,
    submittedAt: "2024-01-23 09:00",
    duration: "0 minutes",
    status: "in_progress",
  },
];

const assessmentStats = {
  totalSubmissions: 156,
  averageScore: 82.5,
  passRate: 87,
  completionRate: 94,
};

export function AssessmentMonitoringTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment Monitoring
          </h2>
          <p className="text-gray-600">
            Monitor student assessment results and performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {assessmentStats.totalSubmissions}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {assessmentStats.averageScore}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {assessmentStats.passRate}%
            </div>
            <div className="text-sm text-gray-600">Pass Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {assessmentStats.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessment Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
          <CardDescription>
            Latest student submissions and scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessmentResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {result.studentName}
                  </TableCell>
                  <TableCell>{result.assessmentTitle}</TableCell>
                  <TableCell>{result.course}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {result.score}/{result.maxScore}
                      </span>
                      <div className="w-16">
                        <Progress
                          value={(result.score / result.maxScore) * 100}
                          className="h-2"
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((result.score / result.maxScore) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{result.duration}</TableCell>
                  <TableCell>{result.submittedAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        result.status === "completed" ? "default" : "secondary"
                      }
                      className={
                        result.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {result.status === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
