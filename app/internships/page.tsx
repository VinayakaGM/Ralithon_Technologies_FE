"use client";

import { useState, useEffect, useRef } from "react";
import {
    BookOpen,
    Clock,
    Users,
    Award,
    Check,
    X,
    Star,
    Calendar,
    DollarSign,
    Zap,
    Target,
    BarChart3,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AuthModal } from "@/components/ui/auth-modal";
import Image from "next/image";
import { toast } from "sonner";
import AuthService from "@/services/auth.service";
import usersService, { Course, EnrolledCourse } from "@/services/users.service";
import AdminCourseService from "@/services/admin.service";
import authService from "@/services/auth.service";
import type {
    RazorpayCheckoutResponse,
    VerifyResponse,
} from "@/services/razorpay";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function InternshipsPage() {
    const [mounted, setMounted] = useState(false);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [courseError, setCourseError] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [startDate, setStartDate] = useState("");
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isTakingAssessment, setIsTakingAssessment] = useState(false);
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAssessmentConfirmModal, setShowAssessmentConfirmModal] = useState(false);
    const [showEnrollConfirmModal, setShowEnrollConfirmModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "free" | "paid">("all");
    const [customMessage, setCustomMessage] = useState<string | undefined>();
    const [activeSection, setActiveSection] = useState("home");

    const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
    const router = useRouter();
    const currentUser = mounted ? AuthService.getCurrentUser() : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (currentUser?.userId) {
            setUserId(currentUser.userId);
        }
    }, [currentUser]);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        setCourseError(null);
        try {
            const response = await AdminCourseService.getAllCourses();

            if (!response) {
                throw new Error("No response from server");
            }

            if (response.success && Array.isArray(response.data)) {
                const activeCourses = response.data.filter(
                    (course) => course.status === true
                );
                setCourses(activeCourses);
            } else {
                throw new Error(response.message || "Invalid course data format");
            }
            await fetchUserData();
        } catch (error) {
            setCourseError(
                error instanceof Error ? error.message : "An unknown error occurred"
            );
            console.error("Failed to fetch courses:", error);
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchUserData = async () => {
        const currentUser = localStorage.getItem("user");
        if (!currentUser) return;

        try {
            const user = JSON.parse(currentUser);
            if (user?.userId) {
                setUserId(user.userId);
                const response = await usersService.getEnrolledCourses(user.userId);
                if (response.success) {
                    setEnrolledCourses(response.data);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const filteredCourses = courses.filter(course => {
        if (activeFilter === "all") return true;
        if (activeFilter === "free") return course.courseType?.toLowerCase() === "free";
        if (activeFilter === "paid") return course.courseType?.toLowerCase() !== "free";
        return true;
    });

    const freeCourses = courses.filter(course => course.courseType?.toLowerCase() === "free");
    const paidCourses = courses.filter(course => course.courseType?.toLowerCase() !== "free");

    const handleTakeAssessmentClick = (course: Course) => {
        if (!userId) {
            toast.error("Please log in to take assessment");
            setShowAuthModal(true);
            return;
        }
        setSelectedCourse(course);
        setShowAssessmentConfirmModal(true);
    };

    const handleTakeAssessment = async (course: Course) => {
        if (!userId) {
            toast.error("Please log in to take assessment");
            setShowAuthModal(true);
            return;
        }

        setIsTakingAssessment(true);
        try {
            const response = await usersService.attemptAssessment(
                userId,
                selectedCourse.assessmentId
            );

            if (!response.success || !response.data) {
                toast.error(response.message || "Failed to start assessment");
                return;
            }

            const data = response.data;

            if (data.orderId && data.razorpayKey && data.amount && data.currency) {
                toast.error(
                    "You have used all free attempts. Please pay to continue the assessment."
                );

                await new Promise((resolve) => setTimeout(resolve, 2000));

                await loadRazorpay();

                const options = {
                    key: data.razorpayKey,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Ralithon Technologies",
                    description: `Assessment payment for ${course.courseName}`,
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        try {
                            const token = authService.getAuthToken();
                            const verifyResp = await axios.post(
                                `${process.env.NEXT_PUBLIC_BASE_API_URL}payment/verify/${userId}`,
                                {
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (verifyResp.data?.status) {
                                toast.success("Payment successful! Starting assessment...");
                                const assessmentResponse = await usersService.attemptAssessment(
                                    userId,
                                    selectedCourse.assessmentId
                                );

                                if (
                                    assessmentResponse.success &&
                                    assessmentResponse.data?.assessment
                                ) {
                                    const assessmentState = {
                                        data: {
                                            success: true,
                                            message:
                                                assessmentResponse.data.message ||
                                                "Assessment loaded successfully",
                                            data: {
                                                assessmentId: selectedCourse.assessmentId,
                                                assessment: assessmentResponse.data.assessment,
                                                attemptId: assessmentResponse.data.attemptId || null,
                                            },
                                        },
                                        courseName: course.courseName,
                                        courseId: course.courseId,
                                    };
                                    localStorage.setItem(
                                        "assessmentState",
                                        JSON.stringify(assessmentState)
                                    );
                                    router.push("/assessment");
                                } else {
                                    toast.error(
                                        assessmentResponse.message ||
                                        "Failed to start assessment after payment"
                                    );
                                }
                            } else {
                                toast.error("Payment verification failed");
                            }
                        } catch (verErr: any) {
                            toast.error(
                                "Payment verification error: " +
                                (verErr.message || "Unknown error")
                            );
                        }
                    },
                    prefill: {
                        email: currentUser?.email || "",
                        contact: userDetails?.phoneNumber || "",
                    },
                    theme: {
                        color: "#0274ba",
                    },
                };

                const rzp = new (window as any).Razorpay(options);

                rzp.on("payment.failed", function (response: any) {
                    toast.error(
                        "Payment failed: " + (response.error.description || "Unknown error")
                    );
                });

                rzp.open();
                setShowCourseModal(false);
            } else if (data.assessment) {
                toast.success(data.message || "Assessment started successfully!");
                setShowCourseModal(false);

                const assessmentState = {
                    data: {
                        success: true,
                        message: data.message || "Assessment loaded successfully",
                        data: {
                            assessmentId: selectedCourse.assessmentId,
                            assessment: data.assessment,
                            attemptId: data.attemptId || null,
                            ...(data.orderId && { orderId: data.orderId }),
                            ...(data.amount && { amount: data.amount }),
                            ...(data.currency && { currency: data.currency }),
                            ...(data.razorpayKey && { razorpayKey: data.razorpayKey }),
                        },
                    },
                    courseName: course.courseName,
                    courseId: course.courseId,
                };
                localStorage.setItem(
                    "assessmentState",
                    JSON.stringify(assessmentState)
                );
                router.push("/assessment");
            } else {
                toast.error("Invalid assessment data received");
            }
        } catch (error: any) {
            console.error("Assessment error:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "An error occurred while starting the assessment"
            );
        } finally {
            setIsTakingAssessment(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleEnrollClick = (course: Course) => {
        if (!startDate) {
            toast.error("Please select a start date");
            return;
        }
        setSelectedCourse(course);
        setShowEnrollConfirmModal(true);
    };

    const handleEnrollCourse = async (course: Course) => {
        if (!startDate) {
            toast.error("Please select a start date");
            return;
        }

        const convertToDDMMYYYY = (dateString: string): string => {
            const [year, month, day] = dateString.split("-");
            return `${day}-${month}-${year}`;
        };

        try {
            const payload = {
                id: course.courseId,
                startDate: convertToDDMMYYYY(startDate),
                orderType: "COURSE",
                isPaymentDone: false,
            };

            const enrollResponse = await usersService.enrollInCourse(userId, payload);

            if (!enrollResponse.success) {
                toast.error("Enrollment failed: " + enrollResponse.message);
                return;
            }

            toast.success(`Successfully enrolled in ${course.courseName}!`);
            setShowCourseModal(false);

            const token = authService.getAuthToken();
            await loadRazorpay();

            const data = enrollResponse.data;

            if (!data.orderId || !data.razorpayKey) {
                toast.error("Payment setup failed. Please try again.");
                return;
            }

            const options = {
                key: data.razorpayKey,
                amount: data.amount,
                currency: data.currency,
                name: "Ralithon Technologies",
                description: `Payment for ${course.courseName}`,
                order_id: data.orderId,
                handler: async function (response: RazorpayCheckoutResponse) {
                    try {
                        const verifyResp = await axios.post<VerifyResponse>(
                            `${process.env.NEXT_PUBLIC_BASE_API_URL}payment/verify/${userId}`,
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (verifyResp.data.status) {
                            toast.success("Payment successful!");
                            router.push("/student-dashboard/courses");
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (verErr: any) {
                        toast.error(
                            "Payment verification error: " +
                            (verErr.message || "Unknown error")
                        );
                    }
                },
                prefill: {
                    email: currentUser?.email,
                    contact: userDetails.phoneNumber,
                },
                theme: {
                    color: "#0274ba",
                },
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on("payment.failed", function (response: any) {
                toast.error(
                    "Payment failed: " + (response.error.description || "Unknown error")
                );
            });

            rzp.open();
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "An error occurred during enrollment"
            );
        }
    };

    const isCourseEnrolled = (courseId: number) => {
        return enrolledCourses.some((course) => course.id === courseId);
    };

    const resetFields = () => {
        setStartDate("");
    };

    const handleToggleAuthMode = (newMode: "signin" | "signup") => {
        setAuthMode(newMode);
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Add Header */}
            <Header
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                setShowAuthModal={setShowAuthModal}
                setAuthMode={setAuthMode}
                scrollToSection={scrollToSection}
            />

            {isTakingAssessment && (
                <LoadingSpinner message="Preparing your assessment..." />
            )}

            {/* Hero Section */}
            <section className="relative pt-16 pb-18 px-4 overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 -z-10"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>

                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Internships & <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Programs</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                            Gain hands-on experience with industry-relevant projects, expert mentorship, and career-focused learning paths designed to make you job-ready.
                        </p>

                        {/* Free Assessment Banner */}
                        <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <h3 className="text-2xl font-bold text-gray-900">Free Skill Assessment</h3>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Take our comprehensive assessment to evaluate your skills and get certificate.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-gray-700">No Cost</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-gray-700">Instant Results</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-gray-700">Skill Certificate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Users className="h-8 w-8" />, number: "500+", label: "Students Trained" },
                            { icon: <Award className="h-8 w-8" />, number: "95%", label: "Completion Rate" },
                            { icon: <BarChart3 className="h-8 w-8" />, number: "200+", label: "Projects Completed" },
                            { icon: <Star className="h-8 w-8" />, number: "4.8/5", label: "Student Rating" },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-4 text-blue-600">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-cyan-500">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Programs?</h2>
                        <p className="text-xl text-blue-50 max-w-2xl mx-auto">
                            Industry-recognized training that prepares you for real-world success
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Award className="h-8 w-8" />, title: "Industry Certificate", desc: "Get recognized credentials" },
                            { icon: <Users className="h-8 w-8" />, title: "Expert Mentors", desc: "Learn from industry professionals" },
                            { icon: <TrendingUp className="h-8 w-8" />, title: "Career Growth", desc: "Advance your tech career" },
                            { icon: <Zap className="h-8 w-8" />, title: "Hands-on Projects", desc: "Build real applications" }
                        ].map((benefit, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                                <p className="text-blue-50">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {/* Filter Tabs */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                            {[
                                { key: "all", label: "All Programs", count: courses.length },
                                { key: "free", label: "Free Internships", count: freeCourses.length },
                                { key: "paid", label: "Premium Programs", count: paidCourses.length },
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key as any)}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeFilter === filter.key
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                                        : "text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    {filter.label} ({filter.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Programs Grid */}
                    {loadingCourses ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="animate-pulse rounded-2xl shadow-sm">
                                    <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                                    <div className="p-6 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                                        <div className="h-10 bg-gray-200 rounded mt-4" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : courseError ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 font-medium">{courseError}</p>
                            <Button onClick={fetchCourses} className="mt-4">Retry</Button>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 font-medium">No programs found for the selected filter.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map((course, index) => (
                                <Card
                                    key={index}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                                >
                                    {/* Course Image & Badge */}
                                    <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-t-2xl overflow-hidden">
                                        <Image
                                            src={course.courseImageUrl}
                                            alt={course.courseName}
                                            fill
                                            className="object-contain p-6 transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${course.courseType?.toLowerCase() === "free"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-blue-100 text-blue-600"
                                                }`}>
                                                {course.courseType?.toUpperCase() || "PAID"}
                                            </div>
                                        </div>
                                        {/* {course.courseType?.toLowerCase() !== "free" && (
                                            <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                                                <DollarSign className="h-5 w-5 text-blue-600" />
                                            </div>
                                        )} */}
                                    </div>

                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2">
                                            {course.courseName}
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 line-clamp-2">
                                            {course.description || "Gain industry-ready skills with hands-on projects"}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Course Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    {course.durationInWeek ? `${course.durationInWeek} weeks` : "Flexible"}
                                                </div>
                                                {course.courseType?.toLowerCase() !== "free" && (
                                                    <div className="font-bold text-blue-600">
                                                        ₹{course.courseFee?.toFixed(2) || "0.00"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => handleTakeAssessmentClick(course)}
                                                variant="outline"
                                                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Target className="h-4 w-4 mr-2" />
                                                Free Assessment
                                            </Button>

                                            {isCourseEnrolled(course.courseId) ? (
                                                <div className="w-full text-center py-2 px-4 bg-green-100 text-green-700 rounded-lg font-medium">
                                                    <Check className="h-4 w-4 inline mr-2" />
                                                    Enrolled
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        currentUser ? setShowCourseModal(true) : (setShowAuthModal(true), setCustomMessage(`Please register or sign in to enroll in ${course.courseName}`));
                                                    }}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                                                >
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    {course.courseType?.toLowerCase() === "free" ? "Enroll Now" : "Get Started"}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Launch Your Career?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join hundreds of students who have transformed their careers with our industry-focused programs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                            onClick={() => setShowAuthModal(true)}
                        >
                            Start Free Assessment
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
                            onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Programs
                        </Button>
                    </div>
                </div>
            </section> */}

            {/* Add Footer */}
            <Footer
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                scrollToSection={scrollToSection}
            />

            {/* Rest of your modals remain the same */}
            {/* Course Modal */}
            {selectedCourse && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${showCourseModal ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div
                        className={`bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all ${showCourseModal ? "scale-100" : "scale-95"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {selectedCourse.courseName}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span
                                            className={`text-xs font-bold rounded-full px-3 py-1 ${selectedCourse.courseType?.toLowerCase() === "free"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-blue-100 text-blue-600"
                                                }`}
                                        >
                                            {selectedCourse.courseType?.toUpperCase() || "PAID"}
                                        </span>
                                        {selectedCourse.courseType?.toLowerCase() !== "free" && (
                                            <span className="text-lg font-bold text-blue-600">
                                                ₹{selectedCourse.courseFee?.toFixed(2) || "0.00"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCourseModal(false);
                                    resetFields();
                                }}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="w-full h-48 md:h-56 relative rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-blue-50 to-cyan-50">
                                    <Image
                                        src={selectedCourse.courseImageUrl || `${IMAGE_URL}placeholder.svg`}
                                        alt={selectedCourse.courseName}
                                        fill
                                        className="object-contain p-4"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={false}
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Course Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Duration:</span>
                                            <span className="text-gray-800">
                                                {selectedCourse.durationInWeek ? `${selectedCourse.durationInWeek} weeks` : "Flexible"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Type:</span>
                                            <span className="text-gray-800">{selectedCourse.courseType || "Paid"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Assessment:</span>
                                            <span className="text-green-600 font-medium">Available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800 mb-3">Get Started</h4>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Preferred Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={startDate}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => handleTakeAssessmentClick(selectedCourse)}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5"
                                    >
                                        <Target className="h-4 w-4 mr-2" />
                                        Take Free Assessment
                                    </Button>

                                    {isCourseEnrolled(selectedCourse.courseId) ? (
                                        <div className="w-full text-center py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium">
                                            <Check className="h-4 w-4 inline mr-2" />
                                            Already Enrolled
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handleEnrollClick(selectedCourse)}
                                            disabled={!startDate}
                                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5"
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            {selectedCourse.courseType?.toLowerCase() === "free"
                                                ? "Enroll for Free"
                                                : `Enroll Now - ₹${selectedCourse.courseFee?.toFixed(2)}`}
                                        </Button>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h5 className="font-semibold text-gray-800 mb-3">What's Included:</h5>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        {[
                                            "Hands-on projects and real-world exercises",
                                            "Certificate of completion",
                                            "Expert mentorship and support",
                                            "Career guidance and placement assistance",
                                            selectedCourse.courseType?.toLowerCase() !== "free" && "Priority support",
                                        ].filter(Boolean).map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assessment Confirmation Modal */}
            {showAssessmentConfirmModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Skill Assessment</h3>
                            <button
                                onClick={() => setShowAssessmentConfirmModal(false)}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Target className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Test your skills and get personalized recommendations for {selectedCourse.courseName}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <p className="font-medium text-gray-800">Assessment Details:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <Clock className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                        <span>30 minutes duration</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Award className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                        <span>Instant results and analysis</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                        <span>No cost - completely free</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAssessmentConfirmModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={() => {
                                    setShowAssessmentConfirmModal(false);
                                    handleTakeAssessment(selectedCourse);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                            >
                                Start Assessment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Confirmation Modal */}
            {showEnrollConfirmModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Confirm Enrollment</h3>
                            <button
                                onClick={() => setShowEnrollConfirmModal(false)}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Check className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            You're about to start your journey with {selectedCourse.courseName}!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">Program:</span>
                                        <span>{selectedCourse.courseName}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">Start Date:</span>
                                        <span>{new Date(startDate).toLocaleDateString()}</span>
                                    </div>
                                    {selectedCourse.courseType?.toLowerCase() !== "free" && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Amount:</span>
                                            <span className="font-bold text-blue-600">
                                                ₹{selectedCourse.courseFee?.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEnrollConfirmModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowEnrollConfirmModal(false);
                                    handleEnrollCourse(selectedCourse);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors"
                            >
                                {selectedCourse.courseType?.toLowerCase() === "free"
                                    ? "Confirm Enrollment"
                                    : `Pay ₹${selectedCourse.courseFee?.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    setCustomMessage(undefined);
                }}
                mode={authMode}
                onAuthSuccess={() => {
                    if (selectedCourse) {
                        setShowCourseModal(true);
                    }
                }}
                onModeChange={handleToggleAuthMode}
                customMessage={customMessage}
            />
        </div>
    );
}