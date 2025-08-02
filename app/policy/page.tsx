"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Target,
  Wrench,
  Scale,
  Users,
  FileText,
  DollarSign,
  XCircle,
  RefreshCw,
  Shield,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function PolicyPage() {
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

  return (
    <div className="min-h-screen bg-white">
      {" "}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <img
                  src={`${IMAGE_URL}logo.png`}
                  alt="Modern office space"
                  className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ralithon Technologies
                </h1>
                <p className="text-sm text-gray-600">
                  Privacy Policy & Terms of Service
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Document Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Privacy Policy & Terms of Service
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This document outlines our policies, terms, and conditions governing
            the use of our technology services and educational programs. Please
            read these terms carefully before using our services.
          </p>
        </div>

        {/* Company Information */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              1. Company Information
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Details
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-medium">Company Name:</span> Ralithon
                  Technologies
                </p>
                <p>
                  <span className="font-medium">Business Type:</span> Technology
                  Services & Educational Training
                </p>
                <p>
                  <span className="font-medium">Registration:</span> [MSME / LLP
                  / Pvt. Ltd.]
                </p>
                <p>
                  <span className="font-medium">Compliance:</span> Companies
                  Act, 2013
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-blue-600" />
                  <span>shivanshshivhare44@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-blue-600" />
                  <span>+91 8109867611</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-blue-600" />
                  <span>PU-4 behind orbit mall,Indore [M.P.]</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Services Overview */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Target className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              2. Services Overview
            </h2>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Our Objectives
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
              <li>Delivery of digital technology solutions to clients</li>
              <li>
                Execution of training, internship, and certification programs
              </li>
              <li>
                Handling of payments, cancellations, and refunds in accordance
                with our policies
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Service Categories
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-blue-600">
                  Technology Development Services
                </h4>
                <ul className="text-gray-700 space-y-2 ml-4">
                  <li>• Custom website development</li>
                  <li>• Mobile application development</li>
                  <li>• Technologies: HTML, CSS, React, Flutter, Python</li>
                  <li>• Agile methodology with milestone-based delivery</li>
                  <li>• Iterative client feedback and quality assurance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-blue-600">
                  Training & Certification Programs
                </h4>
                <ul className="text-gray-700 space-y-2 ml-4">
                  <li>• Short-term courses in emerging technologies</li>
                  <li>
                    • Specializations: AI/ML, Web3, DevOps, Cloud Computing
                  </li>
                  <li>• Internship opportunities based on assessments</li>
                  <li>• Professional certifications upon completion</li>
                  <li>• Transparent and nominal fee structure</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Terms of Service */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <FileText className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              3. Terms of Service
            </h2>
          </div>

          {/* Payment Terms */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                3.1 Payment Terms
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <ul className="space-y-3 text-gray-700">
                <li>
                  • All fees are due in advance and payable exclusively through
                  Razorpay payment gateway
                </li>
                <li>
                  • Technology development projects follow milestone-based
                  payment structure
                </li>
                <li>
                  • Training and internship fees must be paid in full before
                  course commencement
                </li>
                <li>• Digital invoices are issued for all transactions</li>
                <li>
                  • Payments are non-transferable and non-refundable except as
                  specified in our refund policy
                </li>
                <li>
                  • Company is not liable for third-party payment gateway
                  failures or user input errors
                </li>
                <li>
                  • All transactions are processed through secure, verified
                  channels
                </li>
              </ul>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                3.2 Cancellation Policy
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <ul className="space-y-3 text-gray-700">
                <li>
                  • Cancellation requests must be submitted within 12 hours of
                  payment confirmation
                </li>
                <li>
                  • No cancellations or refunds will be processed after the
                  12-hour window
                </li>
                <li>
                  • Cancellation requests must be submitted in writing to our
                  support team
                </li>
                <li>
                  • All cancellation requests are subject to internal review and
                  approval
                </li>
                <li>
                  • Clients must provide valid reasons for cancellation requests
                </li>
              </ul>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                3.3 Refund & Remediation Policy
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <ul className="space-y-3 text-gray-700">
                <li>
                  • Refund eligibility requires cancellation request within 12
                  hours and internal approval
                </li>
                <li>
                  • Refund processing timeline: Up to 15 business days from
                  approval date
                </li>
                <li>
                  • Refunds may be denied if services have been substantially
                  delivered
                </li>
                <li>
                  • Client-side delays or miscommunications may affect refund
                  eligibility
                </li>
                <li>
                  • Refunds are processed through the original payment method
                </li>
                <li>• Processing fees may be deducted from refund amounts</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Legal & Compliance */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Scale className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              4. Legal & Compliance
            </h2>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              4.1 Regulatory Compliance
            </h3>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>
                • Company is registered and compliant with Companies Act, 2013
              </li>
              <li>
                • All contracts and deliverables adhere to Indian Contract Act
                provisions
              </li>
              <li>
                • Educational services are private and skill-based, not
                affiliated with UGC
              </li>
              <li>• No formal degree programs are offered</li>
              <li>
                • All business activities comply with applicable Indian laws and
                regulations
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              4.2 Business Practices
            </h3>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>
                • All service offerings are clearly documented and agreed upon
              </li>
              <li>• No misleading claims or false advertising</li>
              <li>• Transparent communication regarding service limitations</li>
              <li>• User agreement required for all Terms & Conditions</li>
              <li>• Regular compliance audits and reviews</li>
            </ul>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Privacy Policy */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              5. Privacy Policy
            </h2>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              5.1 Data Collection & Usage
            </h3>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>
                • Personal information is collected only for service execution
                purposes
              </li>
              <li>• User data is kept confidential and secure at all times</li>
              <li>
                • Information is not shared with unauthorized third parties
              </li>
              <li>
                • Data retention policies comply with applicable regulations
              </li>
              <li>
                • Users have the right to request data deletion upon service
                completion
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              5.2 Payment Security
            </h3>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>
                • All payment data is processed through Razorpay's secure
                infrastructure
              </li>
              <li>• Industry-standard encryption protocols are employed</li>
              <li>• No payment information is stored on our servers</li>
              <li>• PCI DSS compliance maintained through payment processor</li>
              <li>• Regular security audits and vulnerability assessments</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              5.3 Data Protection Measures
            </h3>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Secure data transmission using SSL/TLS encryption</li>
              <li>• Access controls and authentication mechanisms</li>
              <li>• Regular backup and disaster recovery procedures</li>
              <li>• Employee training on data protection protocols</li>
              <li>• Incident response procedures for data breaches</li>
            </ul>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Internal Operations */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Users className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              6. Internal Operations & Oversight
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                6.1 Service Monitoring
              </h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Operations & Compliance team oversight</li>
                <li>• Regular quality assurance reviews</li>
                <li>• Continuous service improvement processes</li>
                <li>• Client feedback integration and analysis</li>
                <li>• Performance metrics tracking and reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                6.2 Risk Management
              </h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Anti-fraud measures implementation</li>
                <li>• Director & Company Secretary oversight</li>
                <li>• Incident reporting channels</li>
                <li>• Regular compliance audits</li>
                <li>• Risk assessment and mitigation strategies</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Business Declaration */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Wrench className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              7. Business Activity Declaration
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3 text-gray-700">
              <li>
                • All services are delivered digitally; no physical goods are
                provided
              </li>
              <li>
                • Payments are processed for services rendered or to be rendered
              </li>
              <li>
                • Non-transferable payment policy except as outlined in refund
                terms
              </li>
              <li>
                • Service delivery timelines are communicated clearly to clients
              </li>
              <li>
                • Quality standards maintained across all service offerings
              </li>
              <li>• Regular review and updates of service methodologies</li>
            </ul>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Contact & Support */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Mail className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              8. Contact & Support
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                8.1 General Inquiries
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  shivanshshivhare44@gmail.com
                </p>
                <p>
                  <span className="font-medium">Phone:</span> +91 8109867611
                </p>
                <p>
                  <span className="font-medium">Business Hours:</span> Monday -
                  Friday, 9:00 AM - 6:00 PM IST
                </p>
                <p>
                  <span className="font-medium">Address:</span> PU-4 behind
                  orbit mall,Indore [M.P.]
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                8.2 Support & Complaints
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-medium">Support Email:</span>{" "}
                  shivanshshivhare44@gmail.com
                </p>
                <p>
                  <span className="font-medium">Response Time:</span> Within
                  24-48 hours
                </p>
                <p>
                  <span className="font-medium">Escalation:</span>{" "}
                  director@ralithon.com
                </p>
                <p>
                  <span className="font-medium">Complaint Resolution:</span> 5-7
                  business days
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-16" />
        </section>

        {/* Footer Information */}
        <section className="bg-blue-50 p-8 rounded-lg border border-blue-200">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <span>
                  <strong>Effective Date:</strong> 02 August 2025
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <span>
                  <strong>Last Updated:</strong> 02 August 2025
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 leading-relaxed mb-4">
                By using our services, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and
                Privacy Policy. We reserve the right to update these terms at
                any time, with changes becoming effective immediately upon
                posting on our website.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For any questions or clarifications regarding these terms,
                please contact our support team using the information provided
                above. We are committed to maintaining transparency and
                addressing any concerns promptly.
              </p>
            </div>

            <div className="pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-500">
                © 2024 Ralithon Technologies. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
