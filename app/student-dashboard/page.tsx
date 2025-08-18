"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentHeader } from "@/components/student-header";
import  ProfileTab  from "@/app/student-dashboard/profile/page";
import  AssessmentsTab  from "@/app/student-dashboard/assessments/page";
import  CoursesTab  from "@/app/student-dashboard/courses/page";
import  CertificatesTab  from "@/app/student-dashboard/certificates/page";
import  AchievementsTab  from "@/app/student-dashboard/achievements/page";
import authService from "@/services/auth.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
      <LoadingSpinner message="Loading Student Dashboard..."/>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "assessments":
        return <AssessmentsTab />;
      case "courses":
        return <CoursesTab />;
      case "certificates":
        return <CertificatesTab />;
      case "achievements":
        return <AchievementsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <StudentHeader />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
