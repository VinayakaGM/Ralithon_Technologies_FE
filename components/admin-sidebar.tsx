"use client";

import { Users, FileText, BookOpen, NotebookText } from "lucide-react";
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
import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  {
    id: "users",
    title: "User Management",
    icon: Users,
    path: "/admin-dashboard/users",
  },
  {
    id: "assessments",
    title: "Assessment Monitoring",
    icon: FileText,
    path: "/admin-dashboard/assessments",
  },
  {
    id: "courses",
    title: "Course Management",
    icon: BookOpen,
    path: "/admin-dashboard/courses",
  },
  {
    id: "enrolled-assessments",
    title: "My Assessments",
    icon: FileText,
    path: "/admin-dashboard/enrolled-assessments",
  },
  {
    id: "enrolled-courses",
    title: "My Courses",
    icon: BookOpen,
    path: "/admin-dashboard/enrolled-courses",
  },
  {
    id: "notes",
    title: "Notes",
    icon: NotebookText,
    path: "/admin-dashboard/notes",
  },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const router = useRouter();
  const pathname = usePathname();

  // derive activeTab based on current route
  const currentActive =
    menuItems.find((item) => pathname.startsWith(item.path))?.id || activeTab;

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
          <h2 className="text-lg font-bold text-gray-800">Admin Dashboard</h2>
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
                    isActive={currentActive === item.id}
                    className={`w-full justify-start p-3 rounded-lg transition-all duration-300 ${
                      currentActive === item.id
                        ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                    style={{
                      paddingTop: "30px",
                      paddingBottom: "30px",
                    }}
                  >
                    <item.icon
                      className={`h-5 w-5 mr-3 ${
                        currentActive === item.id
                          ? "text-white"
                          : "text-current"
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-medium ${
                          currentActive === item.id
                            ? "text-white"
                            : "text-current"
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
