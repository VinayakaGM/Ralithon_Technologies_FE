"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentHeader } from "@/components/student-header";
import { ProfileTab } from "@/components/student-tabs/profile-tab";
import { AssessmentsTab } from "@/components/student-tabs/assessments-tab";
import { CoursesTab } from "@/components/student-tabs/courses-tab";
import { CertificatesTab } from "@/components/student-tabs/certificates-tab";
import { AchievementsTab } from "@/components/student-tabs/achievements-tab";
import authService from "@/services/auth.service";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
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
            Loading Student Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} />;
      case "assessments":
        return <AssessmentsTab />;
      case "courses":
        return <CoursesTab />;
      case "certificates":
        return <CertificatesTab />;
      case "achievements":
        return <AchievementsTab />;
      default:
        return <ProfileTab user={user} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <StudentHeader user={user} />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
