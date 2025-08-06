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
import { LogOut, Settings, User, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    profilePicture: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-gradient-to-br  h-8 from-blue-600 to-blue-800 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
