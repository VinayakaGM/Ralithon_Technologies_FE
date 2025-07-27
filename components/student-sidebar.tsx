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
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Student Dashboard
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
