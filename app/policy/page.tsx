"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Target,
  Wrench,
  CreditCard,
  Scale,
  Users,
  FileText,
  DollarSign,
  XCircle,
  RefreshCw,
  Shield,
  ArrowLeft,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export default function PolicyPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "overview",
      title: "Company Overview",
      icon: <Building2 className="h-6 w-6" />,
      color: "from-blue-500 to-blue-700",
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 transform hover:scale-105 transition-all duration-300">
              <p className="font-semibold text-blue-800">
                <strong>Company Name:</strong> Ralithon Technologies
              </p>
              <p className="text-blue-700 mt-2">
                <strong>Nature of Business:</strong> Technology Services &
                Educational Training
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 transform hover:scale-105 transition-all duration-300">
              <ul className="list-disc list-inside space-y-2 text-indigo-700">
                <li>Custom website and mobile app development</li>
                <li>
                  Skill-based training, internships, and certifications in
                  emerging technologies (AI/ML, Web3, DevOps, etc.)
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "objective",
      title: "Objective",
      icon: <Target className="h-6 w-6" />,
      color: "from-green-500 to-green-700",
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            "Delivery of digital technology solutions to clients",
            "Execution of training, internship, and certification programs",
            "Handling of payments, cancellations, and refunds",
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  {index + 1}
                </div>
                <Sparkles className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-green-700 text-sm">{item}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "services",
      title: "Scope of Services",
      icon: <Wrench className="h-6 w-6" />,
      color: "from-purple-500 to-purple-700",
      content: (
        <div className="space-y-8">
          <div className="relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
              <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg mr-3 animate-pulse">
                1
              </span>
              Tech Development Services
            </h3>
            <div className="space-y-3 relative z-10">
              <p className="text-purple-700">
                Designing and developing custom websites and mobile
                applications.
              </p>
              <p className="text-purple-700">
                Technologies used: HTML, CSS, React, Flutter, Python, etc.
              </p>
              <p className="text-purple-700">
                Projects follow Agile methodology with iterative client feedback
                and milestone-based delivery.
              </p>
            </div>
          </div>

          <div className="relative p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-200 rounded-full -ml-16 -mt-16 opacity-50"></div>
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
              <span className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg mr-3 animate-pulse">
                2
              </span>
              Training & Certification Programs
            </h3>
            <div className="space-y-3 relative z-10">
              <ul className="list-disc list-inside space-y-2 text-indigo-700">
                <li>
                  Short-term courses in emerging technologies (AI/ML, Web3,
                  DevOps, etc.)
                </li>
                <li>
                  Internship opportunities based on assessments/interviews
                </li>
                <li>
                  Certificates awarded after successful course completion and
                  evaluation
                </li>
                <li>Nominal, transparent fee structure for all programs</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "payment",
      title: "Payment Policy",
      icon: <CreditCard className="h-6 w-6" />,
      color: "from-orange-500 to-orange-700",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-orange-700">
              All payments are collected online via Razorpay through secure and
              verified channels.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 transform hover:scale-105 transition-all duration-300">
              <p className="font-semibold text-blue-800">Tech Development:</p>
              <p className="text-blue-700">Payments are milestone-based.</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 transform hover:scale-105 transition-all duration-300">
              <p className="font-semibold text-green-800">
                Training/Internships:
              </p>
              <p className="text-green-700">
                Fees are prepaid before course commencement.
              </p>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-gray-700">
              Invoices are digitally issued for all transactions.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "legal",
      title: "Legal & Compliance",
      icon: <Scale className="h-6 w-6" />,
      color: "from-red-500 to-red-700",
      content: (
        <div className="space-y-4">
          {[
            "Company registered under [MSME / LLP / Pvt. Ltd.] and compliant with Companies Act, 2013.",
            "Educational services are private, skill-based, and not affiliated with UGC or formal degrees.",
            "Contracts & Deliverables adhere to Indian Contract Act & IPC provisions where applicable.",
            "No misleading claims; all offerings are documented & user-agreed via Terms & Conditions.",
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-red-700">{item}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "oversight",
      title: "Internal Oversight",
      icon: <Users className="h-6 w-6" />,
      color: "from-teal-500 to-teal-700",
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-teal-700">
              All services and training programs are monitored by Operations &
              Compliance team.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-cyan-700">
              Anti-fraud measures and reporting channels are managed by Director
              & Company Secretary.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "business",
      title: "Business Activity Declaration",
      icon: <FileText className="h-6 w-6" />,
      color: "from-violet-500 to-violet-700",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-violet-700">
              Services are digital-only; no physical goods are delivered.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-purple-700">
              Payments are non-transferable and non-refundable except as per
              refund policy below.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const policyTerms = [
    {
      id: "payment-terms",
      title: "Payment Terms",
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-emerald-500 to-emerald-700",
      content: [
        "All fees are due in advance, payable only via Razorpay.",
        "Non-transferable & non-refundable, unless explicitly covered under refund policy.",
        "Ralithon Technologies is not responsible for third-party payment gateway failures, user-side input errors, or indirect losses.",
      ],
    },
    {
      id: "cancellation",
      title: "Cancellation Policy",
      icon: <XCircle className="h-6 w-6" />,
      color: "from-red-500 to-red-700",
      content: [
        "Clients may request cancellation within 12 hours of confirmed payment.",
        "No cancellation or refunds will be entertained beyond 12 hours.",
      ],
    },
    {
      id: "refund",
      title: "Refund & Remediation",
      icon: <RefreshCw className="h-6 w-6" />,
      color: "from-blue-500 to-blue-700",
      content: [
        "Refund eligibility depends on submission of cancellation request within 12 hours and internal review approval.",
        "Processing timeline: Up to 15 business days.",
        "Refund may be rejected if services have been substantially delivered or client-side delays/miscommunications impact deliverables.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header
        className={`bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200 sticky top-0 z-50 transition-all duration-700 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={`${IMAGE_URL}logo.png`}
                    alt="Modern office space"
                    className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 "
                    style={{ width: "51px" }}
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Ralithon Technologies
                  </h1>
                  <p className="text-sm text-gray-800 animate-fade-in">
                    Privacy & Policy / Terms & Conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Privacy Policy & Terms
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Comprehensive policies and terms governing our technology services
            and educational programs
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              id={section.id}
              data-section
              className={`overflow-hidden border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-700 transform hover:scale-[1.02] ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                background:
                  activeSection === section.id
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.7)",
              }}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all duration-300`}
                    >
                      {section.icon}
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {section.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color} animate-pulse`}
                    ></div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 transform transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 transform transition-transform duration-300" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <div
                className={`transition-all duration-500 ease-in-out ${
                  expandedSections.includes(section.id)
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <CardContent className="pt-0 pb-6">
                  <Separator className="mb-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <div className="animate-fade-in">{section.content}</div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Policy Terms */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">
            Detailed Terms & Conditions
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {policyTerms.map((term, index) => (
              <Card
                key={term.id}
                className={`h-full border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{
                  animationDelay: `${(index + sections.length) * 0.1}s`,
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${term.color} rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse`}
                    >
                      {term.icon}
                    </div>
                    <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {term.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {term.content.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-3 group"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Assurance */}
        <Card
          className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-2xl transition-all duration-1000 transform hover:scale-[1.02] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent">
                Privacy Assurance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "User information is kept confidential and used only for service execution.",
                "No personal data is shared with unauthorized third parties.",
                "Payment data is handled securely via Razorpay following industry-standard encryption.",
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-green-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-green-800">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Effective Dates */}
        <Card
          className={`mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-xl transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="font-semibold text-gray-800">
                    Effective Date: [Insert Date]
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="font-semibold text-gray-800">
                    Last Updated: [Insert Date]
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
