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
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

const assessments = [
  {
    id: 1,
    title: "JavaScript Fundamentals Quiz",
    course: "Web Development Basics",
    score: 85,
    maxScore: 100,
    status: "completed",
    completedAt: "2024-01-15",
    duration: "30 minutes",
  },
  {
    id: 2,
    title: "React Components Assessment",
    course: "Advanced React",
    score: 92,
    maxScore: 100,
    status: "completed",
    completedAt: "2024-01-20",
    duration: "45 minutes",
  },
  {
    id: 3,
    title: "Database Design Final Exam",
    course: "Database Management",
    status: "upcoming",
    scheduledFor: "2024-02-01",
    duration: "60 minutes",
  },
  {
    id: 4,
    title: "Python Programming Test",
    course: "Python for Beginners",
    status: "available",
    duration: "40 minutes",
  },
];

export function AssessmentsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
        <p className="text-gray-600">
          Track your test scores and upcoming assessments
        </p>
      </div>

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription>{assessment.course}</CardDescription>
                </div>
                <Badge
                  variant={
                    assessment.status === "completed"
                      ? "default"
                      : assessment.status === "upcoming"
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    assessment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : assessment.status === "upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : ""
                  }
                >
                  {assessment.status === "completed" && (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {assessment.status === "upcoming" && (
                    <Calendar className="w-3 h-3 mr-1" />
                  )}
                  {assessment.status === "available" && (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {assessment.status.charAt(0).toUpperCase() +
                    assessment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.status === "completed" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        Score: {assessment.score}/{assessment.maxScore}
                      </span>
                      <span>
                        {Math.round(
                          (assessment.score! / assessment.maxScore!) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(assessment.score! / assessment.maxScore!) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Completed on {assessment.completedAt}
                    </div>
                  </div>
                )}

                {assessment.status === "upcoming" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Scheduled for {assessment.scheduledFor}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Duration: {assessment.duration}
                  </div>

                  {assessment.status === "available" && (
                    <Button>Start Assessment</Button>
                  )}
                  {assessment.status === "completed" && (
                    <Button variant="outline">View Results</Button>
                  )}
                  {assessment.status === "upcoming" && (
                    <Button variant="outline" disabled>
                      Scheduled
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
