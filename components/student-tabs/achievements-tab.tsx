import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Zap, BookOpen, Award } from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "First Course Completed",
    description: "Complete your first course",
    icon: BookOpen,
    earned: true,
    earnedDate: "2024-01-15",
    category: "milestone",
  },
  {
    id: 2,
    title: "Perfect Score",
    description: "Score 100% on an assessment",
    icon: Star,
    earned: true,
    earnedDate: "2024-01-20",
    category: "performance",
  },
  {
    id: 3,
    title: "Speed Learner",
    description: "Complete 3 lessons in one day",
    icon: Zap,
    earned: true,
    earnedDate: "2024-01-18",
    category: "engagement",
  },
  {
    id: 4,
    title: "Course Master",
    description: "Complete 5 courses",
    icon: Trophy,
    earned: false,
    progress: 60,
    target: 5,
    current: 3,
    category: "milestone",
  },
  {
    id: 5,
    title: "Assessment Ace",
    description: "Pass 10 assessments",
    icon: Target,
    earned: false,
    progress: 70,
    target: 10,
    current: 7,
    category: "performance",
  },
  {
    id: 6,
    title: "Certificate Collector",
    description: "Earn 3 certificates",
    icon: Award,
    earned: false,
    progress: 67,
    target: 3,
    current: 2,
    category: "milestone",
  },
];

const stats = {
  totalPoints: 1250,
  level: 5,
  nextLevelPoints: 1500,
  coursesCompleted: 3,
  assessmentsPassed: 7,
  certificatesEarned: 2,
};

export function AchievementsTab() {
  const earnedAchievements = achievements.filter((a) => a.earned);
  const inProgressAchievements = achievements.filter((a) => !a.earned);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        <p className="text-gray-600">
          Track your learning milestones and badges
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPoints}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              Level {stats.level}
            </div>
            <div className="text-sm text-gray-600">Current Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.coursesCompleted}
            </div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.certificatesEarned}
            </div>
            <div className="text-sm text-gray-600">Certificates Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Level Progress
          </CardTitle>
          <CardDescription>
            {stats.nextLevelPoints - stats.totalPoints} points to reach Level{" "}
            {stats.level + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={(stats.totalPoints / stats.nextLevelPoints) * 100}
            className="h-3"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{stats.totalPoints} points</span>
            <span>{stats.nextLevelPoints} points</span>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earned Badges ({earnedAchievements.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {earnedAchievements.map((achievement) => (
            <Card key={achievement.id} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <achievement.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      {achievement.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      Earned {achievement.earnedDate}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* In Progress Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          In Progress ({inProgressAchievements.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {inProgressAchievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <achievement.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {achievement.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {achievement.current}/{achievement.target}
                        </span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {achievement.progress}% complete
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
