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
    return <div>Loading...</div>;
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
      <div className="flex min-h-screen w-full">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <StudentHeader user={user} />
          <main className="p-6">{renderActiveTab()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
