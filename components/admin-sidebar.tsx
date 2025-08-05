"use client";

import {
  Users,
  FileText,
  BookOpen,
  Award,
  BarChart3,
  Bell,
  NotebookText,
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
    id: "notes",
    title: "Notes",
    icon: NotebookText,
    description: "Manage and view notes",
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
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <img
                src={`${IMAGE_URL}logo.png`}
                alt="Modern office space"
                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Admin Dashboard
              </h2>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-semibold mb-4">
            Management Tools
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
                    style={{
                      paddingTop: "30px",
                      paddingBottom: "30px",
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
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
