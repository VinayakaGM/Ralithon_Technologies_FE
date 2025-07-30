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
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <img
              src="/placeholder.svg?height=20&width=20"
              alt="Admin"
              className="w-5 h-5"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-semibold mb-4">
            Management Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start p-3 rounded-lg transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
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
