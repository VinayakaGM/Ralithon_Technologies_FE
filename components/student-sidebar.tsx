"use client";

import { User, FileText, BookOpen, Award, Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "View and update personal info",
  },
  {
    id: "assessments",
    title: "Assessments",
    icon: FileText,
    description: "View tests and scores",
  },
  {
    id: "courses",
    title: "Enrolled Courses",
    icon: BookOpen,
    description: "Your active courses",
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: Award,
    description: "Download certificates",
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: Trophy,
    description: "Badges and milestones",
  },
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
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <img
              src={`${IMAGE_URL}logo.png`}
              alt="Modern office space"
              className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Student Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-semibold mb-4">
            Learning Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3" style={{ gap: "10px" }}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id} style={{ height: "40px" }}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start p-3 rounded-lg transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                    style={{ paddingTop: "30px", paddingBottom: "30px" }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div
                        className={`text-xs ${
                          activeTab === item.id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {item.description}
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
