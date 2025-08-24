"use client";

import { User, FileText, BookOpen, Award, Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
    path: "/student-dashboard/profile",
  },
  {
    id: "assessments",
    title: "Assessments",
    icon: FileText,
    path: "/student-dashboard/assessments",
  },
  {
    id: "courses",
    title: "Enrolled Courses",
    icon: BookOpen,
    path: "/student-dashboard/courses",
  },
  // {
  //   id: "certificates",
  //   title: "Certificates",
  //   icon: Award,
  //   path:"/student-dashboard/certificates"
  // },
  // {
  //   id: "achievements",
  //   title: "Achievements",
  //   icon: Trophy,
  //   path:"/student-dashboard/achievements"
  // },
];

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function StudentSidebar({
  activeTab,
  setActiveTab,
}: StudentSidebarProps) {
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogoClick}
            className="hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={`${IMAGE_URL}logo.png`} alt="Ralithon Technologies" />
            </div>
          </button>
          <h2 className="text-lg font-bold text-gray-800">Student Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3" style={{ gap: "10px" }}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id} style={{ height: "40px" }}>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveTab(item.id);
                      router.push(item.path);
                    }}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start p-3 rounded-lg transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                    style={{ paddingTop: "30px", paddingBottom: "30px" }}
                  >
                    <item.icon
                      className={`h-5 w-5 mr-3 ${
                        activeTab === item.id ? "text-white" : "text-current"
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-medium ${
                          activeTab === item.id ? "text-white" : "text-current"
                        }`}
                      >
                        {item.title}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
