"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import authService from "@/services/auth.service";
import { useEffect, useRef, useState } from "react";

interface StudentHeaderProps {
  user: {
    name: string;
    email: string;
    profilePicture: string;
  };
}

export function StudentHeader({ user }: StudentHeaderProps) {
  const router = useRouter();
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    try {
      authService.logout();
      setIsDropdownOpen(false);
      toast.success("Logged Out Successfully! 👋", {
        description:
          "You have been safely logged out. Thank you for visiting Ralithon Technologies!",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Logout Failed", {
        description: "There was an issue logging you out. Please try again.",
      });
    }
  };

  const currentUser = mounted ? authService.getCurrentUser() : null;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start space-y-2">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">Back</span>
          </button>

          {/* Sidebar trigger and logo */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Ralithon Technologies
                </h1>
                <p className="text-sm text-gray-600">Student Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                      {currentUser.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={
                      currentUser.userType === "ROLE_STUDENT"
                        ? "/student-dashboard"
                        : "/admin-dashboard"
                    }
                    className="w-full"
                  >
                    <div className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>
                        {currentUser.userType === "ROLE_STUDENT"
                          ? "Student Dashboard"
                          : "Admin Dashboard"}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
