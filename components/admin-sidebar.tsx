"use client";

import {
  Users,
  FileText,
  BookOpen,
  Award,
  BarChart3,
  Bell,
} from "lucide-react";
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
    id: "users",
    title: "User Management",
    icon: Users,
    description: "Manage all users and permissions",
  },
  {
    id: "assessments",
    title: "Assessment Monitoring",
    icon: FileText,
    description: "Monitor student assessments",
  },
  {
    id: "courses",
    title: "Course Management",
    icon: BookOpen,
    description: "Manage courses and content",
  },
  {
    id: "certificates",
    title: "Certificate Management",
    icon: Award,
    description: "Issue and manage certificates",
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    description: "View platform analytics",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Send announcements",
  },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
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
