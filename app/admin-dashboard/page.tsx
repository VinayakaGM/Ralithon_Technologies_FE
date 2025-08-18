"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import UserManagementTab from "./users/page";
import AssessmentMonitoringTab from "@/app/admin-dashboard/assessments/page";
import CourseManagementTab from "@/app/admin-dashboard/courses/page";
import CertificateManagementTab from "@/app/admin-dashboard/certificates/page";
import AnalyticsTab from "@/app/admin-dashboard/analytics/page";
import NotificationsTab from "@/app/admin-dashboard/notifications/page";
import authService from "@/services/auth.service";
import NotesManagement from "@/app/admin-dashboard/notes/page";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      router.push("/");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return (
      <LoadingSpinner message="Loading Admin Dashboard..." />
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
      case "notes":
        return <NotesManagement />;
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
          <AdminHeader />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
