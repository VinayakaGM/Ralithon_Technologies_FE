// components/Footer.tsx
"use client";

import { Mail, MapPin, Linkedin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  scrollToSection: (sectionId: string) => void;
}

export function Footer({
  activeSection,
  setActiveSection,
  scrollToSection,
}: FooterProps) {
  const pathName = usePathname();
  const isHomePage = pathName === "/";

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">About Us</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Ralithon Technologies is a leading IT company providing innovative
              technology solutions and comprehensive services to help businesses
              succeed in the digital world.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>career@ralithontechnologies.in</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5" />
                <span>Indore, Madhya Pradesh</span>
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
              ].map((item) =>
                isHomePage ? (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`block w-full text-left hover:text-white transition-colors ${
                      activeSection === item.id
                        ? "text-white font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={`/#${item.id}`}
                    className="block text-gray-400 hover:text-white transition-colors"
                    scroll={false}
                  >
                    {item.label}
                  </Link>
                )
              )}
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
            Copyright © 2025 Designed by{" "}
            <span className="text-white font-semibold">
              Ralithon Technologies
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
