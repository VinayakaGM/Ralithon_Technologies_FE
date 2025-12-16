"use client";

import { useState, useEffect } from "react";
import { CreditCard, Shield, RefreshCw, ChevronUp, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/ui/auth-modal";

export default function PoliciesPage() {
  const [activeSection, setActiveSection] = useState("policies");
  const [activePolicy, setActivePolicy] = useState("payment");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Available Policies
  const policies = [
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "payment", label: "Payment Policy", icon: CreditCard },
    { id: "refund", label: "Refund Policy", icon: RefreshCw },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleToggleAuthMode = (mode: "signin" | "signup") => setAuthMode(mode);
  const handleAuthSuccess = () => setShowAuthModal(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* HEADER */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        scrollToSection={scrollToSection}
      />

      <main className="flex-1">
        <section
          className="text-white py-4 md:py-6"
          style={{
            background: "linear-gradient(270deg, rgb(6 132 190) 0%, rgb(2 116 186) 100%)",
          }}
        >
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

            {/* LEFT TEXT */}
            <div className="max-w-2xl md:pl-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-1">
                Our Policies
              </h1>
              <p className="text-base md:text-lg opacity-90 mb-1">
                Ralithon cares for your privacy and security, every step of the way.
              </p>
              {/* Last Updated */}
              <p className="text-sm opacity-80">
                <strong>Last Updated:</strong> November 25, 2025
              </p>
            </div>

            {/* RIGHT ILLUSTRATION */}
            <div className="flex justify-end pr-2 md:pr-8">
              <img
                src="/images/Privacy-policy.png"
                alt="Legal Terms"
                className="w-32 md:w-48 lg:w-56 object-contain drop-shadow-md"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-5">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-4 rounded-xl shadow-md border text-center">
              <div className="mb-4 flex justify-center">
                <img src="/images/privacy.png" className="h-24" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 mb-6">
                Legal terms governing your use of our platform and services.
              </p>
              <hr className="my-6 border-gray-300" />
              <ul className="text-blue-700 font-medium text-sm space-y-2 text-left">
                <li><a href="#terms">Acceptance of Terms</a></li>
                <li><a href="#terms">Information We Collect</a></li>
                <li><a href="#terms">User Responsibilities</a></li>
                <li><a href="#terms">Intellectual Property</a></li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border text-center">
              <div className="mb-4 flex justify-center">
                <img src="/images/payment.png" className="h-24" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600 mb-6">
                Online payments through secure Razorpay gateway.
              </p>
              <hr className="my-6 border-gray-300" />
              <ul className="text-blue-700 font-medium text-sm space-y-2 text-left">
                <li><a href="#payment">Payment Methods</a></li>
                <li><a href="#payment">Payment Security</a></li>
                <li><a href="#payment">Failed or Incomplete Transactions</a></li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border text-center">
              <div className="mb-4 flex justify-center">
                <img src="/images/refund.png" className="h-24" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Refund</h3>
              <p className="text-sm text-gray-600 mb-6">
                Refunds applicable as per Razorpay & company policy.
              </p>
              <hr className="my-6 border-gray-300" />
              <ul className="text-blue-700 font-medium text-sm space-y-2 text-left">
                <li><a href="#refund">Refund Overview</a></li>
                <li><a href="#refund">Refund Processing Time</a></li>
                <li><a href="#refund">Special Cases</a></li>
              </ul>
            </div>

          </div>
        </section>

        <section id="terms" className="container mx-auto px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>

          {/* 1. Acceptance of Terms */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Acceptance of Terms</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>By accessing or using Ralithon's website, platform, or services, you agree to be bound by these Terms & Conditions.</li>
            <li>If you do not agree with any part of these terms, you must discontinue use of our services immediately.</li>
            <li>These terms apply to all visitors, users, and others who access or use the service.</li>
            <li>We reserve the right to update or modify these terms at any time without prior notice.</li>
          </ul>

          {/* 2. Information We Collect */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Information We Collect</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li><strong>Personal Information:</strong> Name, phone number, email address (collected for certification, account creation, and communication purposes)</li>
            <li><strong>Payment Information:</strong> Processed securely via Razorpay (we <strong>do not store card/UPI/banking details</strong> on our servers)</li>
            <li><strong>Technical Information:</strong> Automatically collected for security, analytics, and platform improvement:
              <ul className="list-disc ml-6 space-y-1 mt-2">
                <li>IP addresses and device identifiers</li>
                <li>Operating system and browser details</li>
                <li>Browsing behavior (pages visited, clicks, session duration)</li>
                <li>Device specifications and connectivity information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </li>
            <li><strong>Course Progress Data:</strong> Your learning progress, quiz scores, and certification status</li>
          </ul>

          {/* 3. User Account and Responsibilities */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">User Account and Responsibilities</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>All activities under your account are your responsibility</li>
            <li>You must provide accurate and complete information during registration</li>
            <li>You agree not to share your account access with others</li>
            <li>You must not use our platform for any unlawful or prohibited activities</li>
            <li>You agree not to attempt to gain unauthorized access to any part of our system</li>
          </ul>

          {/* 4. Course Access and Usage */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Course Access and Usage</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>Course access is granted upon successful payment confirmation</li>
            <li>Access duration is as specified for each course at the time of purchase</li>
            <li>Course materials are for personal, non-commercial use only</li>
            <li>Sharing, reproducing, or distributing course content without permission is prohibited</li>
            <li>We reserve the right to revoke access for violation of these terms</li>
          </ul>

          {/* 5. Intellectual Property */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Intellectual Property</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>All course content, materials, logos, and platform design are property of Ralithon</li>
            <li>Users are granted a limited, non-exclusive, non-transferable license to access course materials</li>
            <li>You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, or create derivative works from our content</li>
            <li>Certificates issued are for personal use and may not be used for commercial purposes without permission</li>
          </ul>

          {/* 6. Limitation of Liability */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Limitation of Liability</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>Ralithon provides services "as is" without warranties of any kind</li>
            <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
            <li>We do not guarantee specific outcomes from course completion</li>
            <li>We are not responsible for technical issues beyond our control</li>
            <li>Our total liability shall not exceed the amount paid for the specific course</li>
          </ul>

          {/* 7. Termination */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Termination</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>We may terminate or suspend your account for violations of these terms</li>
            <li>You may terminate your account by contacting our support team</li>
            <li>Upon termination, your right to use our services will immediately cease</li>
            <li>Termination does not relieve you of obligations to pay any outstanding amounts</li>
          </ul>

          {/* 8. Governing Law */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Governing Law and Dispute Resolution</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>These terms are governed by the laws of India</li>
            <li>Any disputes shall be subject to the exclusive jurisdiction of courts in India</li>
            <li>We encourage users to contact us first to resolve any issues amicably</li>
          </ul>

          {/* 9. Contact Information */}
          {/* <h3 className="text-xl font-semibold text-gray-800 mb-2">Contact Information</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
            <li>For questions about these Terms & Conditions, contact us at:</li>
            <li>Email: legal@ralithon.com</li>
            <li>Phone: [Your Contact Number]</li>
            <li>Address: [Your Company Address]</li>
            <li>We strive to respond to all inquiries within 48 business hours</li>
          </ul> */}
        </section>

        <section id="payment" className="container mx-auto px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Policy</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Methods</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>Ralithon provides paid courses, and payments are collected securely via <strong>Razorpay</strong>.</li>
            <li>Supported methods: UPI, Debit/Credit Cards, Net Banking, and Wallets (all via Razorpay gateway).</li>
            <li>Payments are processed instantly, confirming your course registration and access.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Security</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>All transactions are <strong>encrypted and PCI-DSS compliant</strong> through Razorpay.</li>
            <li>Ralithon never stores your card, UPI, or banking credentials.</li>
            <li>Razorpay handles fraud detection and secure verification to protect your data.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed or Incomplete Transactions</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
            <li>If a transaction fails or is incomplete, Razorpay automatically reverses the amount to your original payment source.</li>
            <li>You may retry the payment without additional charges.</li>
            <li>For persistent issues, contact Ralithon support with your transaction ID for assistance.</li>
          </ul>
        </section>

        <section id="refund" className="container mx-auto px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Policy</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Refund Overview</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>Refunds are applicable only for valid payment issues like duplicate payments or failed transactions.</li>
            <li>Once course access or certification registration is provided, refunds are not available.</li>
            <li>All refunds are processed via Razorpay to your original payment method.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Refund Processing Time</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mb-4 space-y-1">
            <li>Refunds are typically processed within <strong>5–10 working days</strong> after verification.</li>
            <li>Time may vary based on your bank's processing speed and Razorpay guidelines.</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Special Cases</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
            <li>Technical issues preventing payment completion may be refunded even after course registration, upon review.</li>
            <li>Any dispute or exception is handled individually by Ralithon support in coordination with Razorpay.</li>
          </ul>
        </section>
      </main>

      <Footer
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToSection={scrollToSection}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onModeChange={handleToggleAuthMode}
      />
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50"
          aria-label="Scroll to top"
          style={{ animation: "fadeIn 0.3s ease-out", background: "linear-gradient(270deg, rgb(6 132 190) 0%, rgb(2 116 186) 100%)" }}
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}