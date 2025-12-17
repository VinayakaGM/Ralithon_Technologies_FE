"use client";

import { Separator } from "@/components/ui/separator";
import {
  Target,
  Scale,
  FileText,
  RefreshCw,
  Calendar,
  FileEdit,
  CreditCard,
  Clock,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowAuthModal={setShowAuthModal}
        scrollToSection={scrollToSection}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Document Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Terms and Conditions of Service Agreement
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This document outlines our policies, terms, and conditions governing
            the use of our technology services and educational programs. Please
            read these terms carefully before using our services.
          </p>
        </div>

        {/* Services Overview */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Target className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Article I: Services Framework
            </h2>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              1.1 Service Definitions and Scope
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
              <li>
                <strong>Digital Technology Solutions:</strong> Custom software
                development, system integration, and technical consulting
                services delivered pursuant to individually executed Statements
                of Work ("SOWs") that specify deliverables, timelines, and
                acceptance criteria.
              </li>
              <li>
                <strong>Educational Programs:</strong> Non-degree,
                non-accredited professional training programs, including but not
                limited to: (i) technical skill development courses; (ii)
                internship programs with project-based learning components; and
                (iii) competency certification assessments.
              </li>
              <li>
                <strong>Ancillary Services:</strong> Technical support,
                maintenance services, and other professional services as may be
                mutually agreed in writing between the parties.
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">
              Service Exclusions:
            </h4>
            <p className="text-gray-700 mb-2">
              Unless expressly stated in a signed SOW, Services do not include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
              <li>Third-party licensing fees or hardware costs</li>
              <li>Customizations beyond specified requirements</li>
              <li>On-site support or training</li>
              <li>Legal or regulatory compliance consulting</li>
            </ul>
          </div>
          <Separator className="my-8" />
        </section>

        {/* Payment Terms Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Article II: Payment Terms
            </h2>
          </div>

          {/* Payment Terms 1.1-1.4 */}
          <div className="mb-10">
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1.1 Payment Processing Requirements
              </h3>
              <p className="text-gray-700 mb-4">
                All payments shall be remitted in advance and exclusively
                through the designated payment gateway, Razorpay, against
                system-generated tax invoices issued digitally by RAlithon
                Technologies (hereinafter referred to as "the Company").
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                1.2 Consideration Terms
              </h3>
              <p className="text-gray-700 mb-4">
                The consideration received shall be deemed as full and final for
                the services rendered and is non-transferable and
                non-refundable, except in cases expressly provided for herein.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                1.3 Liability Disclaimer
              </h3>
              <p className="text-gray-700 mb-4">
                The Company disclaims any liability arising out of or incidental
                to failed transactions, incorrect payment inputs, or service
                interruptions attributable to third-party payment aggregators,
                in accordance with Section 79 of the Information Technology Act,
                2000, which provides safe harbour protection to intermediaries.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                1.4 Clarification on Charges
              </h3>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-gray-700">
                  <strong>Important Notice:</strong> Pursuant to Section 10 of
                  the Indian Contract Act, 1872, the Company hereby clarifies
                  that the monetary consideration collected pertains solely to
                  the certification and final examination services.
                  Instructional content, lectures, training materials, or any
                  pedagogical interaction, whether live or recorded, are offered
                  gratis (free of charge) as a value-added component and do not
                  constitute a part of the fee-based transaction.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Cancellation Window Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Clock className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Article III: Cancellation Window
            </h2>
          </div>

          <div className="mb-10">
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2.1 Cancellation Request Timeline
              </h3>
              <p className="text-gray-700 mb-4">
                The client (hereinafter referred to as "the Participant") may
                submit a formal cancellation request within a period of twelve
                (12) hours from the time of successful payment acknowledgment.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                2.2 Request Submission Requirements
              </h3>
              <p className="text-gray-700 mb-4">
                Requests must be submitted in writing via electronic mail to the
                Company's official communication channel. Any request received
                post the expiry of the aforementioned window shall be deemed
                time-barred and non-actionable.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                2.3 Legal Framework
              </h3>
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-gray-700">
                  This clause is in consonance with Section 65 of the Indian
                  Contract Act, 1872, which governs restitution in void
                  contracts, and shall be interpreted strictly in cases of
                  unilateral cancellation by the Participant.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
        </section>

        {/* Refund & Remediation Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <RefreshCw className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Article IV: Refund & Remediation Procedure
            </h2>
          </div>

          <div className="mb-10">
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                3.1 Refund Processing Timeline
              </h3>
              <p className="text-gray-700 mb-4">
                In cases where cancellation requests fall within the permitted
                timeframe and pass internal eligibility verification, the
                Company shall initiate refund processing, which may require up
                to fifteen (15) business days, depending upon banking timelines
                and reconciliation protocols.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                3.2 Refund Denial Criteria
              </h3>
              <p className="text-gray-700 mb-3">
                The Company reserves the sole and exclusive discretion to deny
                any refund request in instances where:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                <li>
                  Substantial services, including examination access,
                  certification processing, or resource allocation, have already
                  been rendered.
                </li>
                <li>
                  Participant-side delays, failures, or non-cooperation have
                  adversely impacted the agreed scope of delivery.
                </li>
                <li>
                  Misuse, manipulation, or misrepresentation of terms is
                  suspected.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                3.3 Final Authority and Compliance
              </h3>
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <p className="text-gray-700">
                  <strong>Final Decision:</strong> All refund decisions shall be
                  final and binding, subject to applicable laws and regulations,
                  including but not limited to the Consumer Protection Act, 2019
                  and the Information Technology (Reasonable Security Practices
                  and Procedures and Sensitive Personal Data or Information)
                  Rules, 2011.
                </p>
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
              Article V: Contractual Terms & Obligations
            </h2>
          </div>

          {/* Payment Terms */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                5.1 Financial Terms and Conditions
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Payment Structures:
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="font-medium">
                  • Fixed-Price Technology Projects:
                </li>
                <li className="ml-4">
                  - 50% non-refundable deposit payable upon SOW execution
                </li>
                <li className="ml-4">
                  - 30% milestone payment upon delivery of alpha version
                </li>
                <li className="ml-4">
                  - 20% balance due upon final acceptance
                </li>
                <li className="font-medium">• Educational Programs:</li>
                <li className="ml-4">
                  - Full payment required 72 hours prior to program commencement
                </li>
                <li className="ml-4">
                  - Installment plans available only with approved credit
                  application
                </li>
                <li className="font-medium">• Payment Processing:</li>
                <li className="ml-4">
                  - All payments processed via Razorpay (Payment Gateway
                  Partner)
                </li>
                <li className="ml-4">
                  - Transaction fees (2.9% + ₹3 per transaction) borne by Client
                </li>
                <li className="ml-4">
                  - Failed payments subject to ₹500 reprocessing fee
                </li>
              </ul>
              <h4 className="font-semibold text-gray-900 mt-4 mb-3">
                Financial Policies:
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li>
                  • Late payments accrue interest at 1.5% per month (18% APR)
                </li>
                <li>
                  • Accounts 30+ days delinquent may be suspended without notice
                </li>
                <li>
                  • All fees quoted in INR; foreign currency conversions at
                  current rates
                </li>
              </ul>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                5.2 Service Modification & Termination
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Cancellation Windows:
              </h4>
              <table className="min-w-full border border-gray-200 mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left border-b">
                      Service Type
                    </th>
                    <th className="px-4 py-2 text-left border-b">
                      Cancellation Period
                    </th>
                    <th className="px-4 py-2 text-left border-b">
                      Administrative Fee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">Technology Projects</td>
                    <td className="px-4 py-2 border-b">
                      12 hours post-deposit
                    </td>
                    <td className="px-4 py-2 border-b">
                      15% of contract value
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Training Programs</td>
                    <td className="px-4 py-2 border-b">
                      7 days pre-commencement
                    </td>
                    <td className="px-4 py-2 border-b">
                      ₹2,500 or 10% (whichever higher)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Internships</td>
                    <td className="px-4 py-2 border-b">
                      Non-cancellable post-start
                    </td>
                    <td className="px-4 py-2 border-b">Full program fee</td>
                  </tr>
                </tbody>
              </table>
              <h4 className="font-semibold text-gray-900 mt-4 mb-3">
                Termination for Cause:
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li>
                  • Material breach by either party subject to 15-day cure
                  period
                </li>
                <li>
                  • Insolvency or bankruptcy proceedings initiate immediate
                  termination
                </li>
                <li>
                  • Force majeure events lasting 30 days permit termination
                </li>
              </ul>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                5.3 Refund Administration Protocol
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Eligibility Criteria:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Timely cancellation per Article 2.2</li>
                    <li>• No accessed program materials or services</li>
                    <li>• Submission of notarized refund affidavit</li>
                    <li>• Completion of exit interview</li>
                    <li>• Return of all proprietary materials</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Processing Details:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 45-60 business day processing timeline</li>
                    <li>• ₹1,000 minimum processing fee</li>
                    <li>• Original payment method required</li>
                    <li>• Foreign currency refunds at current rates</li>
                    <li>• Disputed refunds subject to arbitration</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-yellow-700">
                  <strong>Note:</strong> Refund timelines may extend during bank
                  holidays, fiscal year-end closures, or unforeseen payment
                  processor delays. No interest accrues on refund amounts during
                  processing.
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
        </section>

        {/* Legal & Compliance */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Scale className="h-6 w-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Article VI: Jurisdiction and Governing Law
            </h2>
          </div>
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                4. Jurisdictional Provisions
              </h3>
              <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
                <p className="text-gray-700">
                  <strong>Governing Law:</strong> All disputes, controversies,
                  or claims arising out of or relating to these Terms shall be
                  governed by and construed in accordance with the laws of
                  India, in accordance with the Code of Civil Procedure, 1908.
                </p>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">
                Additional Legal Framework:
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li>
                  • This Agreement shall be governed by and construed in
                  accordance with the laws of India, without regard to conflict
                  of law principles
                </li>
                <li>
                  • Exclusive jurisdiction for all disputes shall be the courts
                  of Indore, Madhya Pradesh
                </li>
                <li>
                  • Mandatory mediation through ICC-India required prior to
                  litigation
                </li>
                <li>
                  • Class action waivers and jury trial waivers expressly agreed
                </li>
                <li>
                  • Prevailing party entitled to reasonable attorneys' fees
                </li>
              </ul>

              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">
                  Limitation of Liability:
                </h4>
                <p className="text-red-700">
                  In no event shall Company's aggregate liability exceed the
                  fees actually paid by Client during the six (6) months
                  preceding the claim. Consequential, incidental, and punitive
                  damages are expressly disclaimed.
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
        </section>

        {/* Footer Information */}
        <section className="bg-blue-50 p-8 rounded-lg border border-blue-200">
          <div className="text-center space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <Calendar className="h-4 w-4 mb-1 text-blue-600" />
                <span>
                  <strong>Effective:</strong> 02 August 2025
                </span>
              </div>
              <div className="flex flex-col items-center">
                <FileEdit className="h-4 w-4 mb-1 text-blue-600" />
                <span>
                  <strong>Version:</strong> 3.2.1
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span>
                  <strong>Document ID:</strong> RT-TOS-2025-08
                </span>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Entire Agreement:</strong> This document constitutes the
                complete and exclusive statement of the agreement between the
                parties, superseding all proposals or prior agreements, oral or
                written. No waiver of any provision shall be effective unless in
                writing. If any provision is held invalid, the remainder shall
                continue in full force and effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Amendment Protocol:</strong> Modifications require (i)
                written notice 30 days in advance, (ii) conspicuous posting on
                Company website, and (iii) affirmative electronic acceptance by
                Client for material changes. Continued use after modifications
                constitutes acceptance.
              </p>
            </div>
            <div className="pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-500">
                Copyright © 2025 Ralithon Technologies. All rights reserved.
                Unauthorized reproduction or distribution prohibited.
                RT-TOS-2025-08
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToSection={scrollToSection}
      />
    </div>
  );
}
