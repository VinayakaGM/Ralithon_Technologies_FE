"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function StudentHeader() {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-gradient-to-br h-8 from-blue-600 to-blue-800 text-white hover:text-white hover:from-blue-700 hover:to-blue-900"
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
