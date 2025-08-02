"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronUp,
  ArrowRight,
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
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import usersService from "@/services/users.service";

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
  const [selectedInternship, setSelectedInternship] = useState<
    (typeof internships)[0] | null
  >(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [customMessage, setCustomMessage] = useState<string | undefined>();
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [showHiringModal, setShowHiringModal] = useState(false);
  const currentUser = mounted ? AuthService.getCurrentUser() : null;

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

  const handleLogout = () => {
    try {
      AuthService.logout();
      setIsDropdownOpen(false);
      toast.success("Logged Out Successfully! 👋", {
        description:
          "You have been safely logged out. Thank you for visiting Ralithon Technologies!",
      });
    } catch (error) {
      toast.error("Logout Failed", {
        description: "There was an issue logging you out. Please try again.",
      });
    }
  };

  const heroSlides = [
    {
      image: `${IMAGE_URL}slide01.png`,
      title: "Welcome to Ralithon Technologies",
      subtitle: "Your Trusted IT Solutions Partner",
    },
    {
      image: `${IMAGE_URL}slide02.png`,
      title: "Innovation Meets Excellence",
      subtitle: "Delivering Cutting-Edge Technology Solutions",
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

  const internships = [
    {
      title: "Web Development",
      image: `${IMAGE_URL}webdev.png`,
      icon: <Code className="h-8 w-8 text-blue-600" />,
      description:
        "Learn to build modern, responsive websites and web applications using HTML, CSS, JavaScript, React, and Node.js. Master front-end and back-end development skills.",
      skills: "HTML, CSS, JavaScript, React, Node.js, MongoDB, Git",
    },
    {
      title: "Graphic Design",
      image: `${IMAGE_URL}graphic.png`,
      icon: <Palette className="h-8 w-8 text-blue-600" />,
      description:
        "Master the art of visual communication through digital design. Learn Adobe Creative Suite, UI/UX principles, branding, and create stunning graphics for web and print.",
      skills: "Photoshop, Illustrator, Figma, UI/UX Design, Branding",
    },
    {
      title: "Java Programming",
      image: `${IMAGE_URL}java.png`,
      icon: <Coffee className="h-8 w-8 text-blue-600" />,
      description:
        "Dive deep into Java programming language and learn object-oriented programming concepts. Build enterprise applications using Spring Framework and work with databases.",
      skills: "Core Java, OOP, Spring Boot, Hibernate, MySQL, REST APIs",
    },
    {
      title: "Android Development",
      image: `${IMAGE_URL}android.png`,
      icon: <Android className="h-8 w-8 text-blue-600" />,
      description:
        "Create powerful Android applications using Kotlin and Java. Learn Android SDK, UI design, database integration, and publish apps to Google Play Store.",
      skills: "Kotlin, Java, Android SDK, Firebase, SQLite, Material Design",
    },
    {
      title: "Data Science",
      image: `${IMAGE_URL}datascience.png`,
      icon: <BarChart className="h-8 w-8 text-blue-600" />,
      description:
        "Explore the world of data science and analytics. Learn Python, machine learning algorithms, data visualization, and statistical analysis to extract insights from data.",
      skills: "Python, Pandas, NumPy, Scikit-learn, Matplotlib, Jupyter",
    },
    {
      title: "Python Programming",
      image: `${IMAGE_URL}cloud.png`,
      icon: <Database className="h-8 w-8 text-blue-600" />,
      description:
        "Master Python programming for web development, automation, and data analysis. Learn Django framework, API development, and database management.",
      skills: "Python, Django, Flask, PostgreSQL, API Development, Automation",
    },
    {
      title: "Cloud Computing",
      image: `${IMAGE_URL}python.png`,
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      description:
        "Learn cloud computing fundamentals and work with AWS, Azure, and Google Cloud. Master containerization, serverless computing, and cloud security practices.",
      skills: "AWS, Azure, Docker, Kubernetes, Serverless, Cloud Security",
    },
    {
      title: "Data Analytics",
      image: `${IMAGE_URL}dataanalytics.png`,
      icon: <Calculator className="h-8 w-8 text-blue-600" />,
      description:
        "Transform raw data into actionable insights using advanced analytics tools. Learn SQL, Tableau, Power BI, and statistical methods for business intelligence.",
      skills:
        "SQL, Tableau, Power BI, Excel, Statistics, Business Intelligence",
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

  const handleInternshipApply = (internshipTitle: string) => {
    const internship = internships.find((i) => i.title === internshipTitle);
    if (!internship) return;

    setSelectedInternship(internship);

    if (AuthService.getCurrentUser()) {
      setShowInternshipModal(true);
    } else {
      setShowAuthModal(true);
      setCustomMessage(
        `Please register or sign in to apply for the ${internshipTitle} internship`
      );
    }
  };

  const handleContactSubmit = (data: ContactFormData) => {
    toast.success("Message Sent Successfully!", {
      description: `Thank you ${data.fullName}! We'll get back to you within 24 hours.`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => scrollToSection("home")}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-1 py-2 font-medium transition-all duration-300 ${
                    activeSection === item.id
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
              <Link
                href="/policy"
                className={`relative px-1 py-2 font-medium transition-all duration-300 ${
                  activeSection === "policy"
                    ? "text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Policy
              </Link>
              {currentUser ? (
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
                      <span
                        className="text-sm font-medium text-gray-700"
                        style={{ marginLeft: "0px" }}
                      >
                        {userDetails
                          ? `${userDetails.firstName}`
                          : currentUser?.email.split("@")[0]}
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
                            : currentUser?.email.split("@")[0]}
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
            className={`lg:hidden overflow-hidden transition-all duration-500 ${
              mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="pt-4 pb-2 space-y-2">
              {[
                { id: "home", label: "Home" },
                { id: "about", label: "About" },
                { id: "services", label: "Services" },
                { id: "internships", label: "Internships" },
                { id: "contact", label: "Contact" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection && scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? "text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <Link
                href="/policy"
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === "policy"
                    ? "text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Policy
              </Link>

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
              className="object-cover"
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
                style={{ animationDelay: `${index * 200}ms` }}
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

      {/* Our Internships Section - Enhanced with detailed information and individual Apply buttons */}
      <section id="internships" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleElements.has("internships-header")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="internships-header"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Our Internships
            </h2>
            <div className="w-20 h-1 bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-8"></div>
          </div>

          {/* Enhanced Internship Cards with detailed information */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {internships.map((internship, index) => (
              <Card
                key={index}
                data-animate
                className={`overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                  visibleElements.has(`internship-${index}`)
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                id={`internship-${index}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  <img
                    src={internship.image || `${IMAGE_URL}placeholder.svg`}
                    alt={internship.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg">
                    {internship.icon}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800 text-center mb-2">
                    {internship.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {internship.description}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Skills you'll learn:
                    </p>
                    <p className="text-xs text-blue-600 font-medium truncate overflow-hidden whitespace-nowrap">
                      {internship.skills}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-sm py-2"
                    onClick={() => handleInternshipApply(internship.title)}
                  >
                    Apply Here
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Text about internships and general Apply Now button */}
          <div
            data-animate
            className={`text-center transform transition-all duration-1000 ${
              visibleElements.has("internships-cta")
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            id="internships-cta"
          >
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our comprehensive internship programs and gain hands-on
              experience with the latest technologies. Our internships provide
              real-world experience, mentorship from industry experts, and the
              opportunity to work on exciting projects. Whether you're
              interested in web development, graphic design, programming, or
              data analytics, we have the perfect program to launch your career
              in technology.
            </p>
          </div>
        </div>
      </section>

      {selectedInternship && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
            showInternshipModal
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`bg-white rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-all ${
              showInternshipModal ? "scale-100" : "scale-95"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  {selectedInternship.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedInternship.title}
                </h3>
              </div>
              <button
                onClick={() => setShowInternshipModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={
                    selectedInternship.image || `${IMAGE_URL}placeholder.svg`
                  }
                  alt={selectedInternship.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-700 mb-4">
                  {selectedInternship.description}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Skills you'll learn:
                  </h4>
                  <p className="text-blue-600 text-sm">
                    {selectedInternship.skills}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800">
                  Get Started With This Internship
                </h4>
                <div className="space-y-3">
                  <Button
                    className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Handle assessment start
                      alert(
                        `Starting assessment for ${selectedInternship.title}`
                      );
                      setShowInternshipModal(false);
                    }}
                  >
                    <span>Take Assessment</span>
                    <ClipboardList className="h-5 w-5" />
                  </Button>
                  <Button
                    className="w-full flex items-center justify-between bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      // Handle course enrollment
                      alert(`Enrolling in ${selectedInternship.title} course`);
                      setShowInternshipModal(false);
                    }}
                  >
                    <span>Enroll in Course</span>
                    <BookOpen className="h-5 w-5" />
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Need help deciding?
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact our internship coordinator for guidance on which
                    option is right for you.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowInternshipModal(false);
                      scrollToSection("contact");
                    }}
                  >
                    Contact Us
                  </Button>
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
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            data-animate
            className={`text-center mb-16 transform transition-all duration-1000 ${
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our services and internship
              programs.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqData.map((faq, index) => (
              <Card
                key={index}
                data-animate
                className={`p-6 hover:shadow-lg transition-all duration-500 ${
                  visibleElements.has(`faq-${index}`)
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                id={`faq-${index}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About Us */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About Us</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Ralithon Technologies is a leading IT company providing
                innovative technology solutions and comprehensive services to
                help businesses succeed in the digital world.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img
                    src={`${IMAGE_URL}logo.png`}
                    alt="Modern office space"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
                <span className="font-bold text-white">
                  Ralithon Technologies
                </span>
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span>Facebook</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span>Twitter</span>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>shivanshshivhare44@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span>PU-4 behind orbit mall,Indore [M.P.]</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                {[
                  { id: "home", label: "Home" },
                  { id: "about", label: "About" },
                  { id: "services", label: "Services" },
                  { id: "internships", label: "Internships" },
                  { id: "contact", label: "Contact" },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <Link
                  href="/policy"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright Message */}
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Designed by{" "}
              <span className="text-white font-semibold">
                Ralithon Technologies
              </span>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Signup / Signin modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setCustomMessage(undefined);
        }}
        onAuthSuccess={() => {
          if (selectedInternship) {
            setShowInternshipModal(true);
          }
        }}
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                We're Hiring!
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
