"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { UserManagementTab } from "@/components/admin-tabs/user-management-tab";
import { AssessmentMonitoringTab } from "@/components/admin-tabs/assessment-monitoring-tab";
import { CourseManagementTab } from "@/components/admin-tabs/course-management-tab";
import { CertificateManagementTab } from "@/components/admin-tabs/certificate-management-tab";
import { AnalyticsTab } from "@/components/admin-tabs/analytics-tab";
import { NotificationsTab } from "@/components/admin-tabs/notifications-tab";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "ROLE_ADMIN") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="Loading"
              className="w-8 h-8"
            />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "users":
        return <UserManagementTab />;
      case "assessments":
        return <AssessmentMonitoringTab />;
      case "courses":
        return <CourseManagementTab />;
      case "certificates":
        return <CertificateManagementTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "notifications":
        return <NotificationsTab />;
      default:
        return <UserManagementTab />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader user={user} />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
