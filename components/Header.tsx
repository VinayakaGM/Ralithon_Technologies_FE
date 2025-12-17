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
      label: "Internships",
      onClick: handleInternshipsClick, // Always goes to separate page
    },
    {
      id: "tests",
      label: "Assessment",
      onClick: () => {
        setMobileMenuOpen(false);
        router.push("/assessments/pretest");
      },
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
    }
    else if (item.id === "tests") {
      return pathName?.startsWith("/assessments"); 
    } else if (item.id === "contact") {
      return pathName === "/contact"; // Only active when on contact page
    }
    return isHomePage && activeSection === item.id;
  };

  const blueGradient = "linear-gradient(270deg, rgb(6, 132, 190) 0%, rgb(2, 116, 186) 100%)";

  return (
    <header className="shadow-lg sticky top-0 z-40 border-b border-gray-800" style={{ backgroundColor: "rgb(17, 24, 39)" }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            onClick={() => isHomePage && setActiveSection("home")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={`/images/logo.jpeg`} alt="Company Logo" className="w-full h-full object-contain" style={{height:"150%", width: "150%"}} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                Ralithon Technologies
              </span>
              <span className="text-sm" style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "grey", fontWeight: "600" }}>
                Digitilization for Everyone
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative px-1 py-2 font-medium transition-all duration-300 ${
                  isNavItemActive(item)
                    ? "text-transparent"
                    : "text-gray-300 hover:text-white"
                }`}
                style={
                  isNavItemActive(item) 
                    ? { 
                        background: blueGradient,
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
                    style={{ background: blueGradient }}
                  />
                )}
              </button>
            ))}
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-gray-800/50 text-white"
                  >
                    <Avatar className="h-10 w-10">
                      {userDetails?.profileImage ? (
                        <AvatarImage
                          src={userDetails.profileImage}
                          alt={`${userDetails.firstName} ${userDetails.lastName}`}
                        />
                      ) : (
                        <AvatarFallback
                          className="text-white"
                          style={{ background: blueGradient }}
                        >
                          {currentUser.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-white">
                      {userDetails
                        ? `${userDetails.firstName}`
                        : currentUser?.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  align="end" 
                  className="w-56 border-gray-700"
                  style={{ backgroundColor: "rgb(17, 24, 39)" }}
                >
                  <DropdownMenuLabel className="border-b border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">
                        {userDetails
                          ? `${userDetails.firstName} ${userDetails.lastName}`
                          : currentUser?.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {!userDetails ? `` : currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={handleDashboardRedirect}
                    disabled={isRedirecting || !isUserDataReady}
                    className="text-gray-200 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer focus:text-white"
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

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300 focus:bg-red-900/20 focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-lg hover:bg-gray-800 border-gray-300 text-gray-300 hover:text-white hover:border-white transition-colors"
                  onClick={handleSignInClick}
                >
                  Sign In
                </Button>
                <Button
                  className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                  style={{ background: blueGradient }}
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            className="lg:hidden border-gray-300 hover:bg-white/10 text-gray-300 hover:text-white"
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
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-screen opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="pt-4 pb-2 space-y-2 rounded-lg p-4" style={{ backgroundColor: "rgb(26, 32, 48)" }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  isNavItemActive(item)
                    ? "text-white border-l-4"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                style={
                  isNavItemActive(item) 
                    ? { 
                        borderLeftColor: "rgb(6, 132, 190)",
                        background: "rgba(6, 132, 190, 0.1)"
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
                  className="flex items-center w-full text-left px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
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
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            )}
            {!currentUser && (
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignInClick();
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignUpClick();
                  }}
                  className="text-white hover:opacity-90 transition-opacity"
                  style={{ background: blueGradient }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}