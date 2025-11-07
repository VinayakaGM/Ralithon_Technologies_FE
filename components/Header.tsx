"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";
import usersService from "@/services/users.service";
import { useSession } from "@/context/SessionContext";
import Link from "next/link";

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: "signin" | "signup") => void;
  scrollToSection: (sectionId: string) => void;
}

export function Header({
  activeSection,
  setActiveSection,
  setShowAuthModal,
  setAuthMode,
  scrollToSection,
}: HeaderProps) {
  const { logout } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isUserDataReady, setIsUserDataReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathName = usePathname();
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [userDetails, setUserDetails] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const isHomePage = pathName === "/";
  const isInternshipsPage = pathName === "/internships";

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentUser = mounted ? AuthService.getCurrentUser() : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAndStoreUserDetails = async () => {
      if (currentUser?.userId) {
        const cachedUserDetails = localStorage.getItem("userDetails");

        if (!cachedUserDetails || userDetails?.userId !== currentUser.userId) {
          try {
            const response = await usersService.getUserById(currentUser.userId);
            if (response.success) {
              setUserDetails(response.data);
              localStorage.setItem(
                "userDetails",
                JSON.stringify(response.data)
              );
              setIsUserDataReady(true);
            }
          } catch (error) {
            console.error("Failed to fetch user details:", error);
          }
        } else if (cachedUserDetails) {
          setUserDetails(JSON.parse(cachedUserDetails));
          setIsUserDataReady(true);
        }
      } else {
        setUserDetails(null);
        localStorage.removeItem("userDetails");
        setIsUserDataReady(true);
      }
    };

    fetchAndStoreUserDetails();
  }, [currentUser?.userId]);

  const handleLogout = () => {
    try {
      AuthService.logout();

      logout();
      setIsDropdownOpen(false);
      toast.success("Logged Out Successfully! 👋", {
        description:
          "You have been safely logged out. Thank you for visiting Ralithon Technologies!",
      });
      router.push("/");
    } catch (error) {
      toast.error("Logout Failed", {
        description: "There was an issue logging you out. Please try again.",
      });
    }
  };

  const handleNavigation = (sectionId: string) => {
    if (isHomePage) {
      setActiveSection(sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
    setMobileMenuOpen(false);
  };

  // FIXED: Always navigate to internships page, never scroll to section
  const handleInternshipsClick = () => {
    router.push("/internships");
    setMobileMenuOpen(false);
  };

   const handleContactUsClick = () => {
    router.push("/contact");
    setMobileMenuOpen(false);
  };

  const handleDashboardRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || isRedirecting) return;

    setIsRedirecting(true);
    try {
      const path =
        currentUser.userType === "ROLE_STUDENT"
          ? "/student-dashboard/profile"
          : "/admin-dashboard/users";

      setTimeout(() => {
        if (isRedirecting) {
          window.location.href = path;
        }
      }, 3000);

      await router.push(path);
    } catch (error) {
      toast.error("Redirect failed", {
        description: "Could not navigate to dashboard. Please try again.",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  const navItems = [
    { id: "home", label: "Home", onClick: () => handleNavigation("home") },
    { id: "about", label: "About", onClick: () => handleNavigation("about") },
    { id: "services", label: "Services", onClick: () => handleNavigation("services") },
    { 
      id: "internships", 
      label: "Internship & Programs", 
      onClick: handleInternshipsClick, // Always goes to separate page
    },
    { id: "contact", label: "Contact", onClick: handleContactUsClick },
  ];

  const handleSignInClick = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  // Helper function to determine if a nav item is active
  const isNavItemActive = (item: any) => {
    if (item.id === "internships") {
      return isInternshipsPage; // Only active when on internships page
    }else if (item.id === "contact") {
      return pathName === "/contact"; // Only active when on contact page
    }
    return isHomePage && activeSection === item.id;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => isHomePage && setActiveSection("home")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={`${IMAGE_URL}logo.png`} alt="Company Logo" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Ralithon Technologies
            </span>
          </Link>
          <nav className="hidden lg:flex space-x-6 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative px-1 py-2 font-medium transition-all duration-300 ${
                  isNavItemActive(item)
                    ? "text-transparent bg-clip-text"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                style={
                  isNavItemActive(item)
                    ? { 
                        background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text"
                      }
                    : {}
                }
              >
                {item.label}
                {isNavItemActive(item) && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                  />
                )}
              </button>
            ))}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-gray-100"
                  >
                    <Avatar className="h-8 w-8">
                      {userDetails?.profileImage ? (
                        <AvatarImage
                          src={userDetails.profileImage}
                          alt={`${userDetails.firstName} ${userDetails.lastName}`}
                        />
                      ) : (
                        <AvatarFallback 
                          className="text-white"
                          style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                        >
                          {currentUser.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span
                      className="text-sm font-medium text-gray-700"
                      style={{ marginLeft: "0px" }}
                    >
                      {userDetails
                        ? `${userDetails.firstName}`
                        : currentUser?.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {userDetails
                          ? `${userDetails.firstName} ${userDetails.lastName}`
                          : currentUser?.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {!userDetails ? `` : currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={handleDashboardRedirect}
                    disabled={isRedirecting || !isUserDataReady}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>
                        {currentUser.userType === "ROLE_STUDENT"
                          ? "Student Dashboard"
                          : "Admin Dashboard"}
                      </span>
                      {(isRedirecting || !isUserDataReady) && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                    </div>
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
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="px-4 py-2 rounded-full hover:bg-gray-50 border-[rgb(2,116,186)] text-[rgb(2,116,186)] hover:text-[rgb(2,116,186)]"
                  onClick={handleSignInClick}
                >
                  Sign In
                </Button>
                <Button
                  className="text-white px-4 py-2 rounded-full"
                  style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            className="lg:hidden bg-transparent"
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="pt-4 pb-2 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium ${
                  isNavItemActive(item)
                    ? "text-transparent bg-clip-text"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={
                  isNavItemActive(item)
                    ? { 
                        background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text"
                      }
                    : {}
                }
              >
                {item.label}
              </button>
            ))}
            {currentUser && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDashboardRedirect(e);
                    setMobileMenuOpen(false);
                  }}
                  disabled={isRedirecting || !isUserDataReady}
                  className="flex items-center w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50"
                >
                  {currentUser.userType === "ROLE_STUDENT"
                    ? "Student Dashboard"
                    : "Admin Dashboard"}
                  {(isRedirecting || !isUserDataReady) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            )}
            {!currentUser && (
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignInClick();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium border border-[rgb(2,116,186)] text-[rgb(2,116,186)] hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignUpClick();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium text-white"
                  style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}