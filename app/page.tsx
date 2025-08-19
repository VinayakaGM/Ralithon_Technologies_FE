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
  const [assessmentData, setAssessmentData] =
    useState<AssessmentAttemptResponse | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

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

  // In your component
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Clean URL after scroll
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
      icon: <Code className="h-20 w-20 text-blue-600" />,
      title: "Web Development",
      description:
        "We create modern, responsive, and user-friendly websites using the latest technologies. Our web development services include custom website design, e-commerce solutions, content management systems, and web applications that help businesses establish a strong online presence.",
    },
    {
      icon: <Smartphone className="h-20 w-20 text-blue-600" />,
      title: "App Development",
      description:
        "Our mobile app development team specializes in creating native and cross-platform applications for iOS and Android. We build feature-rich, scalable mobile apps that provide excellent user experience and help businesses reach their customers on mobile devices.",
    },
    {
      icon: <Brain className="h-20 w-20 text-blue-600" />,
      title: "AI & ML",
      description:
        "Harness the power of Artificial Intelligence and Machine Learning with our advanced solutions. We develop intelligent systems, predictive analytics, natural language processing, and automation tools that help businesses make data-driven decisions and improve efficiency.",
    },
    {
      icon: <Cloud className="h-20 w-20 text-blue-600" />,
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
     
  toast.error("You have used all free attempts. Please pay to continue the assessment.");

  await new Promise(resolve => setTimeout(resolve,2000));

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
              
              if (assessmentResponse.success && assessmentResponse.data?.assessment) {
                const assessmentState = {
                  data: {
                    success: true,
                    message: assessmentResponse.data.message || "Assessment loaded successfully",
                    data: {
                      assessmentId: selectedCourse.assessmentId,
                      assessment: assessmentResponse.data.assessment,
                      attemptId: assessmentResponse.data.attemptId || null,
                    }
                  },
                  courseName: course.courseName,
                  courseId: course.courseId
                };
                localStorage.setItem("assessmentState", JSON.stringify(assessmentState));
                router.push("/assessment");
              } else {
                toast.error(assessmentResponse.message || "Failed to start assessment after payment");
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
          color: "#3399cc",
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
          }
        },
        courseName: course.courseName,
        courseId: course.courseId
      };
      localStorage.setItem("assessmentState", JSON.stringify(assessmentState));
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
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);

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
        <LoadingSpinner message="Preparing your assessment..."/>
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
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <Image
              src={slide.image}
              alt={`Slide ${index + 1}`}
              fill
              // className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1
                  className={`text-5xl md:text-6xl font-bold mb-6 transform transition-all duration-1000 ${
                    index === currentSlide
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-xl md:text-2xl mb-8 transform transition-all duration-1000 delay-300 ${
                    index === currentSlide
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  {slide.subtitle}
                </p>
                <Button
                  size="lg"
                  className={`bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-lg px-8 py-4 transform transition-all duration-1000 delay-500 hover:scale-105 ${
                    index === currentSlide
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* About Company Section - Removed statistics, only company information */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("about-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="about-header"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              About Ralithon Technologies
            </h2>
            <div className="w-20 h-1 bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-8"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* About Company Details - Only company information */}
            <div
              data-animate
              className={`transform transition-all duration-1000 delay-200 ${
                visibleElements.has("about-content")
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
              id="about-content"
            >
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Leading IT Solutions Provider
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ralithon Technologies is a premier IT company dedicated to
                delivering innovative and reliable technology solutions. We
                specialize in transforming businesses through cutting-edge
                technology and digital innovation. Our comprehensive services
                span across web development, mobile applications, artificial
                intelligence, machine learning, and cloud engineering.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our team consists of highly skilled developers, designers,
                engineers, and technology consultants who are passionate about
                creating solutions that drive business growth. We follow
                industry best practices and use the latest technologies to
                ensure our clients receive world-class services that meet their
                specific requirements.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Ralithon Technologies, we believe in building long-term
                partnerships with our clients. We provide end-to-end solutions
                from initial consultation and planning to development,
                deployment, and ongoing support. Our commitment to quality,
                innovation, and customer satisfaction sets us apart in the
                competitive IT industry.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We also offer comprehensive internship programs to nurture the
                next generation of technology professionals. Our training
                programs are designed to provide hands-on experience with
                real-world projects, mentorship from industry experts, and
                career development opportunities in various technology domains.
              </p>
            </div>

            {/* Amazing Photographs */}
            <div
              data-animate
              className={`transform transition-all duration-1000 delay-400 ${
                visibleElements.has("about-images")
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
              id="about-images"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src={`${IMAGE_URL}ralithon01.png`}
                    alt="Team working together"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                  <img
                    src={`${IMAGE_URL}ralithon02.png`}
                    alt="Modern office space"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src={`${IMAGE_URL}ralithon03.png`}
                    alt="Technology innovation"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                  <img
                    src={`${IMAGE_URL}ralithon04.png`}
                    alt="Development process"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("services-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="services-header"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              What We Do
            </h2>
            <div className="w-20 h-1 bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive IT services and solutions to help
              businesses grow and succeed in the digital world. Our expertise
              covers a wide range of technologies and services designed to meet
              your specific business needs.
            </p>
          </div>

          {/* Services Cards - Web Development, App Development, AI & ML, Cloud Engineering */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                data-animate
                className={`text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                  visibleElements.has(`service-${index}`)
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

      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("internships")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="internships"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Internship & Programs
            </h2>
            <div className="w-20 h-1 bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-8"></div>
          </div>

          {loadingCourses ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : courseError ? (
            <div className="text-center py-8">
              <p className="text-red-500">{courseError}</p>
              <Button onClick={fetchCourses} className="mt-4">
                Retry
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p>No courses available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Course Cards - Same structure as Internship cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {courses.map((course, index) => (
                  <Card
                    key={index}
                    data-animate
                    className={`overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${"translate-y-0 opacity-100"}`}
                    id={`course-${index}`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative">
                      <img
                        src={
                          course.courseImageUrl || `${IMAGE_URL}placeholder.svg`
                        }
                        alt={course.courseName}
                        className="w-full h-48"
                      />
                      <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-gray-800 text-center mb-2 truncate">
                        {course.courseName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative group">
                        <div className="relative">
                          <div className="h-[6rem] overflow-y-scroll scrollbar-thin scroll-smooth pr-2 line-clamp-4 mask-fade">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {course.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 rounded-md text-sm flex-wrap gap-2 sm:flex-nowrap">
                        <div className="text-gray-800 font-medium">
                          Duration:{" "}
                          <span className="font-normal">
                            {course.durationInWeek
                              ? `${course.durationInWeek} weeks`
                              : "Flexible"}
                          </span>
                        </div>
                        <div
                          className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${
                            course.courseType?.toLowerCase() === "free"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {course.courseType?.toUpperCase() || "PAID"}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-sm py-2"
                        onClick={() => {
                          setSelectedCourse(course);
                          if (currentUser) {
                            setShowCourseModal(true);
                          } else {
                            setShowAuthModal(true);
                            setCustomMessage(`
          Please register or sign in to enroll in ${course.courseName}`);
                          }
                        }}
                      >
                        Apply Here
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Description text - Same structure as Internships */}
              <div
                data-animate
                className={`text-center transform transition-all duration-1000 ${
                  visibleElements.has("internships")
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                id="internships"
              >
                <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Explore our comprehensive course offerings designed to help
                  you gain practical skills and advance your career. Our
                  programs provide real-world experience, expert instruction,
                  and the opportunity to work on relevant projects in your field
                  of interest.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {selectedCourse && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
            showCourseModal ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all ${
              showCourseModal ? "scale-100" : "scale-95"
            }`}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: showCourseModal
                ? "translate(-50%, -50%)"
                : "translate(-50%, -50%) scale(0.95)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
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
                      className={`text-xs font-bold rounded-full px-3 py-1 ${
                        selectedCourse.courseType?.toLowerCase() === "free"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {selectedCourse.courseType?.toUpperCase() || "PAID"}
                    </span>
                    {selectedCourse.courseType?.toLowerCase() !== "free" && (
                      <span className="text-xs font-medium text-gray-600">
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
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={
                    selectedCourse.courseImageUrl ||
                    ` ${IMAGE_URL}placeholder.svg`
                  }
                  alt={selectedCourse.courseName}
                  className="w-full h-48 rounded-lg mb-4"
                />
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Course Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Duration:
                      </span>
                      <span className="text-sm text-gray-800">
                        {selectedCourse.durationInWeek
                          ? ` ${selectedCourse.durationInWeek} weeks`
                          : "Flexible"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Course Type:
                      </span>
                      <span className="text-sm text-gray-800">
                        {selectedCourse.courseType || "Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Course Fee:
                      </span>
                      <span className="text-sm text-gray-800">
                        {selectedCourse.courseFee
                          ? ` ₹ ${selectedCourse.courseFee.toFixed(2)}`
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Status:
                      </span>
                      <span
                        className={`text-sm ${
                          selectedCourse.status
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedCourse.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800">
                  Get Started With This Course
                </h4>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When would you like to start?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-sm py-2"
                    onClick={() => handleTakeAssessment(selectedCourse)}
                    disabled={isTakingAssessment}
                  >
                    <span>
                       {isTakingAssessment ? "Preparing Your Assessment..." : "Take Free Assessment"}</span>
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  {isCourseEnrolled(selectedCourse.courseId) ? (
                    <div className="w-full text-center py-2 px-4 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                      Enrolled
                    </div>
                  ) : (
                    <Button
                      className={`w-full flex items-center justify-between text-sm py-2 ${
                        selectedCourse.courseType?.toLowerCase() === "free"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                      onClick={() => handleEnrollCourse(selectedCourse)}
                      disabled={!startDate}
                    >
                      <span>
                        {selectedCourse.courseType?.toLowerCase() === "free"
                          ? "Enroll Now"
                          : `Pay ₹${
                              selectedCourse.courseFee?.toFixed(2) || "0.00"
                            }`}
                      </span>
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    What's included:
                  </h5>
                  <ul className="text-sm text-gray-600 mb-3 space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Hands-on projects and exercises</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Certificate of completion</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Expert instructor support</span>
                    </li>
                    {selectedCourse.courseType?.toLowerCase() === "paid" && (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority support and career guidance</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`transform transition-all duration-1000 ${
              visibleElements.has("contact-form")
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
            className={`text-center mb-4 transform transition-all duration-1000 ${
              visibleElements.has("faq-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="faq-header"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers to common questions about our services and internship
              programs.
            </p>

            {/* Expand/Collapse Button */}
            <Button
              onClick={() => setFaqExpanded(!faqExpanded)}
              className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 mx-auto"
            >
              <span>{faqExpanded ? "Hide FAQs" : "View All FAQs"}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${
                  faqExpanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </Button>
          </div>

          {/* Collapsible FAQ Content */}
          <div
            className={`max-w-4xl mx-auto overflow-hidden transition-all duration-500 ease-in-out ${
              faqExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-6 pt-8">
              {faqData.map((faq, index) => (
                <Card
                  key={index}
                  data-animate
                  className={`px-6 py-4 hover:shadow-lg transition-all duration-500 transform ${
                    faqExpanded && visibleElements.has(`faq-${index}`)
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
      {/* Hiring Modal */}
      {showHiringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in fade-in duration-300">
            {/* Close Button */}
            <button
              onClick={handleCloseHiringModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                We're Hiring for Internship!
              </h2>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Join our team and kickstart your career in technology. We are
                currently accepting applications for our comprehensive{" "}
                <span className="bg-yellow-200 px-2 py-1 rounded font-semibold text-gray-800">
                  internship
                </span>{" "}
                programs.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 flex-1"
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
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 shadow-lg z-50"
          size="icon"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
