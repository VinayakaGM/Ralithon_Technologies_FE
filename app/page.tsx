"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronUp,
  ArrowRight,
  Code,
  Smartphone,
  Brain,
  Cloud,
  X,
  ChevronDown,
  BookOpen,
  ClipboardList,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Building,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  Users,
  BarChart3,
  Layout,
  Search,
  Star,
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
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
import {
  ModernContactForm,
  type ContactFormData,
} from "@/components/ui/Contact-form";
import usersService, {
  AssessmentAttemptResponse,
  Course,
  EnrolledCourse,
} from "@/services/users.service";
import AdminCourseService from "@/services/admin.service";
import authService from "@/services/auth.service";
import type {
  RazorpayCheckoutResponse,
  VerifyResponse,
} from "@/services/razorpay";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function RalithonWebsite() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState<string | undefined>();
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showAssessmentConfirmModal, setShowAssessmentConfirmModal] =
    useState(false);
  const [showEnrollConfirmModal, setShowEnrollConfirmModal] = useState(false);
  const [currentMentorIndex, setCurrentMentorIndex] = useState(0);

  // Mentors Data - College Professors
  const mentors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      role: "Professor & HOD",
      department: "Computer Science Department",
      college: "ABC Engineering College",
      experience: "15+ years teaching",
      image: `${IMAGE_URL}professor1.jpg`,
      bio: "Dr. Rajesh Kumar has been guiding students in computer science for over 15 years. His expertise in software engineering and database management has helped shape countless successful careers in the IT industry.",
      expertise: ["Software Engineering", "Database Systems", "Algorithms"],
      achievements: [
        "Guided 50+ student projects",
        "Published 20+ research papers",
        "Industry-Academia Collaboration Expert",
        "Student Mentor Award Winner"
      ],
      words: "The foundation of success in technology lies in strong fundamentals and continuous learning. Your dedication to mastering core concepts will take you far in this ever-evolving field.",
      impact: "Dr. Kumar's guidance helped us establish strong development practices and understand the importance of scalable architecture in our projects."
    },
    {
      id: 2,
      name: "Prof. Sunita Sharma",
      role: "Associate Professor",
      department: "Information Technology",
      college: "XYZ Institute of Technology",
      experience: "12+ years teaching",
      image: `${IMAGE_URL}professor2.jpg`,
      bio: "Prof. Sunita Sharma specializes in web technologies and mobile application development. Her practical approach to teaching has helped students bridge the gap between academic learning and industry requirements.",
      expertise: ["Web Technologies", "Mobile Development", "UI/UX Design"],
      achievements: [
        "Mentored 100+ web projects",
        "Industry Workshop Coordinator",
        "Full Stack Development Expert",
        "Student Innovation Guide"
      ],
      words: "In the world of technology, your ability to adapt and learn new frameworks is as important as your core knowledge. Stay curious and never stop building.",
      impact: "Prof. Sharma's insights into modern web development frameworks were crucial in helping us build responsive and user-friendly applications."
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      role: "Senior Professor",
      department: "Artificial Intelligence",
      college: "PQR College of Engineering",
      experience: "18+ years teaching",
      image: `${IMAGE_URL}professor3.jpg`,
      bio: "With nearly two decades of experience in AI and machine learning, Dr. Amit Patel has been at the forefront of introducing cutting-edge technologies to students. His research in neural networks has been widely recognized.",
      expertise: ["Machine Learning", "Neural Networks", "Data Science"],
      achievements: [
        "AI Research Pioneer",
        "Patent Holder in ML Algorithms",
        "International Conference Speaker",
        "Research Grant Recipient"
      ],
      words: "Artificial Intelligence is not just about algorithms, it's about solving real-world problems. Focus on understanding the problem deeply before jumping to solutions.",
      impact: "Dr. Patel's mentorship in AI concepts enabled us to implement intelligent features in our applications and understand the ethical implications of AI."
    }
  ];

  // Auto-slide for mentors carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMentorIndex((prev) => (prev + 1) % mentors.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mentors.length]);

  const nextMentor = () => {
    setCurrentMentorIndex((prev) => (prev + 1) % mentors.length);
  };

  const prevMentor = () => {
    setCurrentMentorIndex((prev) => (prev - 1 + mentors.length) % mentors.length);
  };

  // Rest of your existing useEffect hooks and state declarations...
  useEffect(() => {
    const lastClosed = localStorage.getItem("hiringModalClosed");
    if (lastClosed) {
      const timePassed = Date.now() - parseInt(lastClosed, 10);
      if (timePassed > 24 * 60 * 60 * 1000) {
        setShowHiringModal(true);
      }
    } else {
      setShowHiringModal(true);
    }
  }, []);

  const handleCloseHiringModal = useCallback(() => {
    setShowHiringModal(false);
    localStorage.setItem("hiringModalClosed", Date.now().toString());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [pathName]);

  const currentUser = mounted ? AuthService.getCurrentUser() : null;

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

  const heroSlides = [
    {
      image: `${IMAGE_URL}slide01.png`,
      title: "Welcome to Ralithon Technologies",
      subtitle: "Your Trusted IT Solutions Partner",
    },
    {
      image: `${IMAGE_URL}slide02.png`,
    },
    {
      image: `${IMAGE_URL}slide03.png`,
      title: "Transform Your Business",
      subtitle: "With Our Expert IT Services",
    },
  ];

  const services = [
    {
      icon: <Code className="h-20 w-20" style={{ color: 'rgb(2, 116, 186)' }} />,
      title: "Web Development",
      description:
        "We create modern, responsive, and user-friendly websites using the latest technologies. Our web development services include custom website design, e-commerce solutions, content management systems, and web applications that help businesses establish a strong online presence.",
    },
    {
      icon: <Smartphone className="h-20 w-20" style={{ color: 'rgb(2, 116, 186)' }} />,
      title: "App Development",
      description:
        "Our mobile app development team specializes in creating native and cross-platform applications for iOS and Android. We build feature-rich, scalable mobile apps that provide excellent user experience and help businesses reach their customers on mobile devices.",
    },
    {
      icon: <Brain className="h-20 w-20" style={{ color: 'rgb(2, 116, 186)' }} />,
      title: "AI & ML",
      description:
        "Harness the power of Artificial Intelligence and Machine Learning with our advanced solutions. We develop intelligent systems, predictive analytics, natural language processing, and automation tools that help businesses make data-driven decisions and improve efficiency.",
    },
    {
      icon: <Cloud className="h-20 w-20" style={{ color: 'rgb(2, 116, 186)' }} />,
      title: "Cloud Engineering",
      description:
        "Our cloud engineering services help businesses migrate to the cloud and optimize their infrastructure. We provide cloud architecture design, deployment, management, and security solutions on platforms like AWS, Azure, and Google Cloud Platform.",
    },
  ];

  const faqData = [
    {
      question: "What services does Ralithon Technologies offer?",
      answer:
        "We offer comprehensive IT services including web development, mobile app development, AI & ML solutions, cloud engineering, and various internship programs to help businesses grow and succeed in the digital world.",
    },
    {
      question: "How can I apply for an internship program?",
      answer:
        "You can apply for our internship programs by clicking the 'Apply Here' button on any specific internship card or by contacting us directly through our contact information provided on the website.",
    },
    {
      question: "What technologies do you work with?",
      answer:
        "We work with modern technologies including React, Node.js, Python, Java, cloud platforms (AWS, Azure, GCP), AI/ML frameworks, and mobile development technologies for both iOS and Android platforms.",
    },
    {
      question: "Do you provide ongoing support after project completion?",
      answer:
        "Yes, we provide comprehensive support and maintenance services after project completion to ensure your applications continue to perform optimally and stay updated with the latest security patches.",
    },
  ];

  useEffect(() => {
    if (!showCourseModal) {
      setStartDate("");
    }
  }, [showCourseModal]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = [
        "home",
        "about",
        "services",
        "internships",
        "mentors",
        "contact",
        "faq",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFields = () => {
    setStartDate("");
  };

  const handleContactSubmit = (data: ContactFormData) => {
    toast.success("Message Sent Successfully!", {
      description: ` Thank you ${data.fullName}! We'll get back to you within 24 hours.`,
    });
  };

  const handleToggleAuthMode = (newMode: "signin" | "signup") => {
    setAuthMode(newMode);
  };

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

  return (
    <div className="min-h-screen bg-white">
      {isTakingAssessment && (
        <LoadingSpinner message="Preparing your assessment..." />
      )}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        scrollToSection={scrollToSection}
      />
      <section id="home" className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
              }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <Image
              src={slide.image}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover 
             w-full h-[200px] 
             sm:h-[300px] 
             md:h-[400px] 
             lg:h-[500px] 
             xl:h-[600px]"
              sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 100vw,
         100vw"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1
                  className={`text-5xl md:text-6xl font-bold mb-6 transform transition-all duration-1000 ${index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                    }`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-xl md:text-2xl mb-8 transform transition-all duration-1000 delay-300 ${index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                    }`}
                >
                  {slide.subtitle}
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 transform transition-all duration-1000 delay-500 hover:scale-105"
                  style={{
                    background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                  }}
                  onClick={() => scrollToSection("about")}
                >
                  Read More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* About Company Section */}
      <section id="about" className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Ralithon Technologies</h2>
            <div
              className="w-24 h-1 bg-gradient-to-r from-[rgb(55,182,241)] to-[rgb(2,116,186)] mx-auto mb-6"
              style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
            ></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforming businesses through innovative technology solutions and digital excellence
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Company Description */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
                <div className="flex items-center mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-4"
                    style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                  >
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Leading IT Solutions Provider</h3>
                </div>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Ralithon Technologies is a premier IT company dedicated to delivering innovative and reliable technology solutions. We specialize in transforming businesses through cutting-edge technology and digital innovation.
                </p>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Our comprehensive services span across web development, mobile applications, artificial intelligence, machine learning, and cloud engineering. We follow industry best practices and use the latest technologies to ensure our clients receive world-class services.
                </p>
              </div>
            </div>

            {/* Stats and Values */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Values</h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Lightbulb className="h-5 w-5" style={{ color: 'rgb(2, 116, 186)' }} />
                    </div>
                    <span className="font-medium text-gray-800">Innovation</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-800">Quality</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-800">Customer Focus</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Rocket className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-800">Growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Points - Horizontal Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="flex items-start bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <Check className="h-4 w-4" style={{ color: 'rgb(2, 116, 186)' }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Industry Best Practices</h4>
                <p className="text-gray-600 text-sm">Following proven methodologies and standards</p>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <Users className="h-4 w-4" style={{ color: 'rgb(2, 116, 186)' }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Expert Team</h4>
                <p className="text-gray-600 text-sm">Skilled developers and consultants</p>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <Handshake className="h-4 w-4" style={{ color: 'rgb(2, 116, 186)' }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Long-term Partnerships</h4>
                <p className="text-gray-600 text-sm">Building lasting client relationships</p>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <GraduationCap className="h-4 w-4" style={{ color: 'rgb(2, 116, 186)' }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Training Programs</h4>
                <p className="text-gray-600 text-sm">Nurturing next-gen professionals</p>
              </div>
            </div>
          </div>

          {/* Expertise Section */}
          <div
            className="rounded-xl p-8 text-white"
            style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Our Expertise</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Web Development</h4>
                <p className="text-sm opacity-90">Modern, responsive websites</p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Mobile Apps</h4>
                <p className="text-sm opacity-90">Native & cross-platform</p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">AI & ML</h4>
                <p className="text-sm opacity-90">Intelligent solutions</p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Cloud Engineering</h4>
                <p className="text-sm opacity-90">Scalable infrastructure</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Ready to Transform Your Business?</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Partner with us for innovative solutions that drive growth and success. Let's discuss your project requirements.
            </p>
            <Button
              onClick={() => scrollToSection("contact")}
              className="text-white px-8 py-3 rounded-lg font-semibold transition duration-300 transform hover:-translate-y-1"
              style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
            >
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="services" className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${visibleElements.has("services-header")
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
              }`}
            id="services-header"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Our Service Approach
            </h2>
            <div
              className="w-20 h-1 mx-auto mb-8"
              style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
            ></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We don't just deliver solutions - we partner with you to understand your business goals and create tailored strategies that drive real results. Our process is designed for maximum impact at every stage of your digital transformation.
            </p>
          </div>

          {/* Service Process Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Search className="h-10 w-10 mx-auto" style={{ color: 'rgb(2, 116, 186)' }} />,
                title: "Discovery & Analysis",
                description: "We begin by deeply understanding your business needs, challenges, and objectives to create a strategic roadmap."
              },
              {
                icon: <Layout className="h-10 w-10 mx-auto" style={{ color: 'rgb(2, 116, 186)' }} />,
                title: "Solution Design",
                description: "Our experts craft tailored solutions that align with your goals and leverage the right technologies."
              },
              {
                icon: <Code className="h-10 w-10 mx-auto" style={{ color: 'rgb(2, 116, 186)' }} />,
                title: "Development & Implementation",
                description: "We build robust, scalable solutions using agile methodologies and industry best practices."
              },
              {
                icon: <BarChart3 className="h-10 w-10 mx-auto" style={{ color: 'rgb(2, 116, 186)' }} />,
                title: "Optimization & Growth",
                description: "We continuously monitor, refine, and enhance your solutions to ensure long-term success."
              }
            ].map((service, index) => (
              <Card
                key={index}
                data-animate
                className={`text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${visibleElements.has(`service-${index}`)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
                  }`}
                id={`service-${index}`}
                style={{ animationDelay: `${index * 200}ms ` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-6">{service.icon}</div>
                  <CardTitle className="text-xl text-gray-800 mb-4">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Internships Section */}
      <section id="courses" className="py-10 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div
            data-animate
            id="internships"
            className={`text-center mb-16 transition-all duration-1000 ${visibleElements.has("internships")
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
              }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Internship & Programs
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-sky-400 to-sky-700" />
            <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
              Gain real-world skills with curated industry-ready programs.
            </p>
          </div>

          {/* Loader */}
          {loadingCourses ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
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
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-gray-600 font-medium">
              No courses available at the moment.
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {courses.map((course, index) => (
                  <Card
                    key={index}
                    data-animate
                    id={`course-${index}`}
                    style={{ animationDelay: `${index * 120}ms` }}
                    className={`overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1`}
                  >
                    <div className="relative">
                      <img
                        src={course.courseImageUrl}
                        alt={course.courseName}
                        className="w-full h-40 object-contain bg-white p-6 rounded-t-xl"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
                        <BookOpen className="h-7 w-7 text-sky-700" />
                      </div>
                    </div>

                    <CardHeader className="pb-1">
                      <CardTitle className="text-lg font-semibold text-gray-800 text-center line-clamp-1">
                        {course.courseName}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5 p-5">
                      {/* Description */}
                      <div className="h-20 overflow-y-auto pr-2 text-sm text-gray-600 leading-relaxed custom-scroll">
                        {course.description || "No description available"}
                      </div>

                      {/* Duration + Badge */}
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-700">
                          Duration: <span className="font-normal">
                            {course.durationInWeek ? `${course.durationInWeek} weeks` : "Flexible"}
                          </span>
                        </span>
                      </div>

                      {/* Button */}
                      <Button
                        size="sm"
                        className="w-full text-sm py-2 rounded-lg font-semibold shadow-md bg-gradient-to-r from-sky-400 to-sky-700 hover:opacity-90"
                        onClick={() => {
                          setSelectedCourse(course);
                          currentUser ? setShowCourseModal(true) : (setShowAuthModal(true), setCustomMessage(`Please register or sign in to enroll in ${course.courseName}`));
                        }}
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bottom Text */}
              <div
                data-animate
                id="internships"
                className={`text-center transition-all duration-1000 ${visibleElements.has("internships")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
                  }`}
              >
                {/* <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Accelerate your learning with hands-on curriculum, real industry mentors,
                  and practical exposure to elevate your career opportunities.
                </p> */}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="mentors" className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Guides</h2>
            <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-sky-400 to-sky-700" />
            <p className="text-gray-500 max-w-md mx-auto">Academic excellence meets industry insight</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentMentorIndex * 100}%)` }}
              >
                {mentors.map((mentor, index) => (
                  <div key={mentor.id} className="w-full flex-shrink-0 px-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100">
                      <div className="grid lg:grid-cols-5 gap-8">

                        {/* Profile Sidebar */}
                        <div className="lg:col-span-2">
                          <div className="text-center lg:text-left">
                            <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto lg:mx-0 mb-4">
                              <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">{mentor.name}</h3>
                            <p className="text-blue-600 text-sm mb-2">{mentor.role}</p>
                            <p className="text-gray-500 text-xs">{mentor.college}</p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                          {/* Expertise */}
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {mentor.expertise.map((skill, skillIndex) => (
                                <span key={skillIndex} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Achievements */}
                          <div className="mb-6">
                            <ul className="space-y-2">
                              {mentor.achievements.map((achievement, achievementIndex) => (
                                <li key={achievementIndex} className="flex items-center text-sm text-gray-600">
                                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <Check className="h-2 w-2 text-green-600" />
                                  </div>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Impact */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-800 leading-relaxed">
                              {mentor.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center mt-8 space-x-4">
              <button onClick={prevMentor} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-1">
                {mentors.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMentorIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentMentorIndex ? "bg-blue-600" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
              <button onClick={nextMentor} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`transform transition-all duration-1000 ${visibleElements.has("contact-form")
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
              }`}
            id="contact-form"
          >
            <ModernContactForm onSubmit={handleContactSubmit} />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-4 transform transition-all duration-1000 ${visibleElements.has("faq-header")
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
              }`}
            id="faq-header"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div
              className="w-20 h-1 mx-auto mb-8"
              style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
            ></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers to common questions about our services and internship
              programs.
            </p>

            {/* Expand/Collapse Button */}
            <Button
              onClick={() => setFaqExpanded(!faqExpanded)}
              className="text-white px-6 py-3 rounded-full flex items-center space-x-2 mx-auto"
              style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
            >
              <span>{faqExpanded ? "Hide FAQs" : "View All FAQs"}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${faqExpanded ? "rotate-180" : "rotate-0"
                  }`}
              />
            </Button>
          </div>

          {/* Collapsible FAQ Content */}
          <div
            className={`max-w-4xl mx-auto overflow-hidden transition-all duration-500 ease-in-out ${faqExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="space-y-6 pt-8">
              {faqData.map((faq, index) => (
                <Card
                  key={index}
                  data-animate
                  className={`px-6 py-4 hover:shadow-lg transition-all duration-500 transform ${faqExpanded && visibleElements.has(`faq-${index}`)
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                    }`}
                  id={`faq-${index}`}
                  style={{
                    animationDelay: faqExpanded ? `${index * 150}ms` : "0ms",
                    transitionDelay: faqExpanded ? ` ${index * 100}ms` : "0ms",
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-start">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed ">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToSection={scrollToSection}
      />

      {/* Signup / Signin modal */}
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
      {showAssessmentConfirmModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Important Notice
              </h3>
              <button
                onClick={() => setShowAssessmentConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please read the following instructions carefully before
                      starting the assessment.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Once you start the assessment, the timer will begin and
                    cannot be paused.
                  </span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    If you navigate away or close the browser window, your
                    assessment will be automatically submitted.
                  </span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    You cannot retake this assessment without purchasing
                    additional attempts.
                  </span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Ensure you have a stable internet connection before
                    proceeding.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssessmentConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAssessmentConfirmModal(false);
                  handleTakeAssessment(selectedCourse);
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2"
                style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
              >
                Continue to Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showEnrollConfirmModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Enrollment
              </h3>
              <button
                onClick={() => setShowEnrollConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      You are about to enroll in{" "}
                      <span className="font-semibold">
                        {selectedCourse.courseName}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>By enrolling in this course, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Complete the course within the specified duration</li>
                  <li>Adhere to the platform's code of conduct</li>
                  <li>Maintain academic integrity in all assessments</li>
                  {selectedCourse.courseType?.toLowerCase() !== "free" && (
                    <li>
                      Pay the course fee of ₹
                      {selectedCourse.courseFee?.toFixed(2)}
                    </li>
                  )}
                </ul>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">Course Start Date:</span>
                    <span>{new Date(startDate).toLocaleDateString()}</span>
                  </div>
                  {selectedCourse.courseType?.toLowerCase() !== "free" && (
                    <div className="flex justify-between mt-2">
                      <span className="font-medium">Amount to Pay:</span>
                      <span className="font-bold">
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEnrollConfirmModal(false);
                  handleEnrollCourse(selectedCourse);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {selectedCourse.courseType?.toLowerCase() === "free"
                  ? "Confirm Enrollment"
                  : `Pay ₹${selectedCourse.courseFee?.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {showHiringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in fade-in duration-300">
            <button
              onClick={handleCloseHiringModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                We're Hiring
              </h2>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Join our team and kickstart your career in technology. We are
                currently accepting applications for our comprehensive{" "}
                <span className="bg-yellow-200 px-2 py-1 rounded font-semibold text-gray-800">
                  internship
                </span>{" "}
                programs.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs font-medium text-green-800">
                      Internship Opportunity
                    </h3>
                    <div className="mt-1 text-xs text-green-700">
                      <p>
                        We offer completely free internship programs with
                        hands-on experience and mentorship.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1"
                  style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
                  onClick={() => {
                    handleCloseHiringModal();
                    scrollToSection("internships");
                  }}
                >
                  View Programs
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleCloseHiringModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button - Bottom Right Corner */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50"
          size="icon"
          style={{ background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)" }}
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}