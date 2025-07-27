"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTab } from "@/components/admin-tabs/user-management-tab";
import { AssessmentMonitoringTab } from "@/components/admin-tabs/assessment-monitoring-tab";
import { CourseManagementTab } from "@/components/admin-tabs/course-management-tab";
import { CertificateManagementTab } from "@/components/admin-tabs/certificate-management-tab";
import { AnalyticsTab } from "@/components/admin-tabs/analytics-tab";
import { NotificationsTab } from "@/components/admin-tabs/notifications-tab";

export function AdminDashboardTabs() {
  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UserManagementTab />
      </TabsContent>

      <TabsContent value="assessments">
        <AssessmentMonitoringTab />
      </TabsContent>

      <TabsContent value="courses">
        <CourseManagementTab />
      </TabsContent>

      <TabsContent value="certificates">
        <CertificateManagementTab />
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsTab />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
    </Tabs>
  );
}
