
"use client";

import { useState, useRef, useEffect } from "react";
import {
    Code,
    Smartphone,
    Brain,
    Cloud,
    Palette,
    Coffee,
    SmartphoneIcon as Android,
    BarChart,
    Database,
    Calculator,
    Mail,
    MapPin,
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Menu,
    X,
    ChevronDown,
    BookOpen,
    ClipboardList,
    User,
    LogOut,
    Check,
    ChevronUp,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { AuthModal } from "@/components/ui/auth-modal";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";
import usersService from "@/services/users.service";

interface HeaderProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    setShowAuthModal: (show: boolean) => void;
    scrollToSection: (sectionId: string) => void;
}

export function Header({
    activeSection,
    setActiveSection,
    setShowAuthModal,
    scrollToSection
}: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
    const [userDetails, setUserDetails] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

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
                        }
                    } catch (error) {
                        console.error("Failed to fetch user details:", error);
                    }
                } else if (cachedUserDetails) {
                    setUserDetails(JSON.parse(cachedUserDetails));
                }
            } else {
                setUserDetails(null);
                localStorage.removeItem("userDetails");
            }
        };

        fetchAndStoreUserDetails();
    }, [currentUser?.userId]);

    const handleLogout = () => {
        try {
            AuthService.logout();
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

    return (
        <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div
                        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => scrollToSection("home")}
                    >
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img
                                src={`${IMAGE_URL}logo.png`}
                                alt="Modern office space"
                            />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                            Ralithon Technologies
                        </span>
                    </div>
                    <nav className="hidden lg:flex space-x-6 items-center">
                        {[
                            { id: "home", label: "Home" },
                            { id: "about", label: "About" },
                            { id: "services", label: "Services" },
                            { id: "internships", label: "Internships" },
                            { id: "contact", label: "Contact" },
                            { id: "courses", label: "Courses" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`relative px-1 py-2 font-medium transition-all duration-300 ${activeSection === item.id
                                        ? "text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800"
                                        : "text-gray-700 hover:text-blue-600"
                                    }`}
                            >
                                {item.label}
                                {activeSection === item.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transform scale-x-100 transition-transform duration-300"></div>
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
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                                                {currentUser.email?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
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

                                    <DropdownMenuItem asChild style={{ cursor: "pointer" }}>
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
                        ) : (
                            <Button
                                className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                                onClick={() => setShowAuthModal(true)}
                            >
                                Sign Up / Sign In
                            </Button>
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
                    className={`lg:hidden overflow-hidden transition-all duration-500 ${mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <nav className="pt-4 pb-2 space-y-2">
                        {[
                            { id: "home", label: "Home" },
                            { id: "about", label: "About" },
                            { id: "services", label: "Services" },
                            { id: "internships", label: "Internships" },
                            { id: "contact", label: "Contact" },
                            { id: "courses", label: "Courses" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    scrollToSection(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${activeSection === item.id
                                        ? "text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}

                        {currentUser && (
                            <>
                                <Link
                                    href={
                                        currentUser.userType === "ROLE_STUDENT"
                                            ? "/student-dashboard"
                                            : "/admin-dashboard"
                                    }
                                    className="block w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {currentUser.userType === "ROLE_STUDENT"
                                        ? "Student Dashboard"
                                        : "Admin Dashboard"}
                                </Link>
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
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowAuthModal(true);
                                }}
                                className="block w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            >
                                Sign Up / Sign In
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}